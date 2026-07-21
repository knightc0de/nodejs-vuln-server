const express = require('express')
const userRouter = require('./controllers/users')
const morgan = require('morgan')
const app = express()

app.use(express.json())
app.use(morgan('dev'))
app.use('/api/users', userRouter)

module.exports = app
