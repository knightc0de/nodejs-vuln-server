/**
 * @file app.js
 * @description exports express app singleton and setups middleware
 */

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const adminRouter = require('./controllers/admin')
const stockRouter = require('./controllers/stock')
/**
 * initalise app singleton
 * @type {Object}
 */
const app = express()


app.use(cors())
app.use(express.json())
app.use(morgan('dev'))
app.use('/api', stockRouter)
app.use('/api',adminRouter)
/**
 * exports app
 * @module app
 */
module.exports = app
