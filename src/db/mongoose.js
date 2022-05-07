require('dotenv/config')

const mongoose = require('mongoose')

mongoose
	.connect(process.env.CONNECTION_STRING, { useNewUrlParser: true })
	.then(() => console.log('Connection is ready'))
	.catch((err) => console.log(err))
