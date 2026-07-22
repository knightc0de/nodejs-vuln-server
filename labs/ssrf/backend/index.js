/**
 * @file main.js
 * @description this file initialises the http server and binds it to a port
*/
const app = require('./app')
const config = require('./config/config')

app.listen(config.PORT, ()=>{
  console.log(`running on port ${config.PORT}`)
})
