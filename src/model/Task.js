const mongoose = require('mongoose')
const validator = require('validator')

const taskSchema = mongoose.Schema(
	{
		description: {
			type: String,
			required: true,
			trim: true,
		},
		completed: {
			type: Boolean,
			default: false,
			trim: true,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'User',
		},
	},
	{
		timestamps: true,
	}
)

exports.Task = mongoose.model('Task', taskSchema)
