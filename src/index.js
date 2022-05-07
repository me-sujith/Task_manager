const express = require('express')
require('./db/mongoose')
const userRoute = require('./router/user')
const taskRoute = require('./router/tasks')
const app = express()
const port = process.env.PORT || 3000

app.use(express.json()) // express purse incoming JSON data Automatically

app.use(userRoute)
app.use(taskRoute)

app.listen(port, () => {
	console.log('The server is running on port' + port)
})
