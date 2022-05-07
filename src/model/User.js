const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Task } = require('../model/Task')

const userSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			unique: true,
			required: true,
			trim: true,
			lowercase: true,
			validate(value) {
				if (!validator.isEmail(value)) {
					throw new Error('Email is invalid')
				}
			},
		},
		password: {
			type: String,
			required: true,
		},
		age: {
			type: Number,
			default: 0,
		},
		tokens: [
			{
				token: {
					type: String,
					required: true,
				},
			},
		],
		avatar: {
			type: Buffer,
		},
	},
	{
		timestamps: true,
	}
)

userSchema.virtual('tasks', {
	ref: 'Task',
	localField: '_id',
	foreignField: 'owner',
})

userSchema.methods.toJSON = function () {
	const user = this.toObject()
	delete user.password
	delete user.tokens
	delete user.avatar

	return user
}

userSchema.methods.generateAuthToken = async function () {
	const user = this
	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

	user.tokens = user.tokens.concat({ token })
	await user.save()
	return token
}

userSchema.statics.findByCredentials = async (email, password) => {
	const user = await this.User.findOne({ email })
	if (!user) {
		throw new Error('Unable to login')
	}

	const isMatch = await bcryptjs.compare(password, user.password)

	if (!isMatch) {
		throw new Error('Unable to login')
	}
	return user
}

// Hash the plain text password
userSchema.pre('save', async function (next) {
	const user = this
	if (user.isModified('password'))
		user.password = await bcryptjs.hash(user.password, 8)
	next()
})

// Delete user task when user is removed
userSchema.pre('remove', async function (next) {
	await Task.deleteMany({ owner: this._id })
	next()
})
exports.User = mongoose.model('User', userSchema)
