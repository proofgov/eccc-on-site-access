// Entry point
const path = require('path')

const express = require('express')

global.APP_ROOT = Object.freeze(path.dirname(__filename))
const routes = require(APP_ROOT + '/routes/index')

const app = express()

const { requester, protocol, hostname, port } = require(path.resolve(
  APP_ROOT,
  'utils/helpers'
))

app.use('/', routes)

app.listen(port, () => console.log(`Server started at ${protocol}//${hostname}:${port}`))

// Export our app for testing purposes
module.exports = app
