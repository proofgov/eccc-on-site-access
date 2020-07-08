// Entry point
const path = require('path')
const url = require('url')

const express = require('express')

global.APP_ROOT = Object.freeze(path.dirname(__filename))
const routes = require(APP_ROOT + '/routes/index')

const app = express()

const { protocol, hostname, port } = url.parse(APP_URL || 'http://localhost:4000')

app.use('/', routes)

app.listen(port, () => console.log(`Server started at ${protocol}//${hostname}:${port}`))

// Export our app for testing purposes
module.exports = app
