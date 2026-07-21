const app = require('./app')
const config = require('./config/config')
const colors = require('./data/colors')

app.listen(config.PORT,() => {
  console.log(`${colors.bold}${colors.green}Running${colors.reset} on ${colors.underline}${colors.cyan}http://localhost:${config.PORT}${colors.reset}`)
})
