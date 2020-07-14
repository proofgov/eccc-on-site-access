// Entry point
const path = require('path')
const url = require('url')

const express = require('express')

global.APP_ROOT = Object.freeze(path.dirname(__filename))
const Logger = require(APP_ROOT + '/utils/logging')
const routes = require(APP_ROOT + '/routes/index')

const app = express()

const { protocol, hostname, port } = url.parse(
  process.env.APP_URL || 'http://localhost:4000'
)

app.use(Logger.requestLogger)
app.use('/', routes)

if (!module.parent) {
  app.listen(port, () => console.log(`Server started at ${protocol}//${hostname}:${port}`))
}

// Export our app for testing purposes
module.exports = app
