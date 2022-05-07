const nodemailer = require('nodemailer')
require('dotenv/config')

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL,
		pass: process.env.PASSWORD,
	},
})
const sendWelcomeMail = (email, name) => {
	const mailOptions = {
		from: process.env.PASSWORD,
		to: 'sujithzeye@gmail.com',
		subject: 'Thanks for joining in ',
		text: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
	}

	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			console.log(error)
		} else {
			console.log('Email sent: ' + info.response)
		}
	})
}

const sendCancellationMail = (email, name) => {
	const mailOptions = {
		from: process.env.PASSWORD,
		to: 'sujithzeye@gmail.com',
		subject: 'Sorry to see you go!',
		text: `Goodbye, ${name}. I hope to see you again.`,
	}

	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			console.log(error)
		} else {
			console.log('Email sent: ' + info.response)
		}
	})
}

module.exports = { sendWelcomeMail, sendCancellationMail }
