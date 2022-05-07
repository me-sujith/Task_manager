const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { User } = require('../model/User')

const multer = require('multer')
const sharp = require('sharp')
const sendMail = require('../emails/sendMail')

router.post('/users', async (req, res) => {
	const user = new User(req.body)

	try {
		sendMail.sendWelcomeMail(user.email, user.name)
		await user.save()

		const token = await user.generateAuthToken()
		res.status(201).send({ user, token })
	} catch (e) {
		res.status(400).send(e)
	}
})

router.post('/users/login', async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password)
		const token = await user.generateAuthToken()
		res.send({ user, token })
	} catch (error) {
		res.status(400).send()
	}
})

router.get('/users/me', auth, async (req, res) => {
	res.send(req.user)
})

router.get('/users', auth, async (req, res) => {
	try {
		const users = await User.find()
		if (!users) return res.status(404).send('User not available')
		res.status(200).send(users)
	} catch (error) {
		res.send(500).send(error)
	}
})

router.post('/users/logout', auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter(
			(token) => token.token !== req.token
		)
		await req.user.save()

		res.send()
	} catch (e) {
		res.status(500).send()
	}
})

router.post('/users/logoutAll', auth, async (req, res) => {
	try {
		req.user.tokens = []
		await req.user.save()

		res.send()
	} catch (e) {
		res.status(500).send(e)
	}
})

// router.get('/users/:id', (req, res) => {
// 	User.findById(req.params.id)
// 		.then((data) => {
// 			if (!data) return res.status(404).send('User not available')
// 			res.status(200).send(data)
// 		})
// 		.catch((error) => {
// 			res.status(500).send(error)
// 		})
// })

router.patch('/users/me', auth, async (req, res) => {
	const updates = Object.keys(req.body)
	const allowedUpdates = ['name', 'email', 'password', 'age']
	const isValidOperation = updates.every((updates) =>
		allowedUpdates.includes(updates)
	)
	if (!isValidOperation) return res.status(400).send('Invalid updates')
	try {
		updates.forEach((update) => (req.user[update] = req.body[update]))
		await req.user.save()
		res.send(req.user)
	} catch (e) {
		res.status(400).send(e)
	}
})

router.delete('/users/me', auth, async (req, res) => {
	try {
		await req.user.remove()
		sendMail.sendCancellationMail(req.user.email, req.user.name)
		res.send(req.user)
	} catch (error) {
		res.status(500).send('Unable to delete user' + error)
	}
})
const upload = multer({
	limits: {
		fileSize: 1000000,
	},
	fileFilter(req, file, callback) {
		if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			return callback(new Error('File must be a image'))
		}

		callback(undefined, true)
	},
})

router.post(
	'/users/me/avatar',
	auth,
	upload.single('avatar'),
	async (req, res) => {
		const buffer = await sharp(req.file.buffer)
			.resize({ width: 250, height: 250 })
			.png()
			.toBuffer()
		req.user.avatar = buffer
		await req.user.save()
		res.send()
	},
	(error, req, res, next) => {
		res.status(400).send({ error: error.message })
	}
)

router.delete('/users/me/avatar', auth, async (req, res) => {
	try {
		req.user.avatar = undefined
		await req.user.save()
		res.send()
	} catch (error) {
		res.status(500).send()
	}
})

router.get('/users/:id/avatar', async (req, res) => {
	try {
		const user = await User.findById(req.params.id)
		if (!user || !user.avatar) throw new Error()
		res.set('Content-Type', 'image/png')
		res.send(user.avatar)
	} catch (error) {
		res.status(404).send()
	}
})

module.exports = router
