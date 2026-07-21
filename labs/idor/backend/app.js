/**
 * @file app.js
 * @description exports express app singleton and setups middleware
 */

const express = require('express')
const userRouter = require('./controllers/users')
const morgan = require('morgan')
const cors = require('cors')

/**
 * initalise app singleton
 * @type {Object}
 */
const app = express()

app.use(cors());
app.use(express.json())
app.use(morgan('dev'))
app.use('/api/users', userRouter)

/**
 * exports app
 * @module app
 */

module.exports = app
