// Entry point
// const https = require('https')
const path = require('path')
const url = require('url')

const express = require('express')
const morgan = require('morgan')

global.APP_ROOT = Object.freeze(path.dirname(__filename))
global.logger = require(APP_ROOT + '/utils/logger')
const routes = require(APP_ROOT + '/routes/index')

// const privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
// const certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
// const credentials = {key: privateKey, cert: certificate};

const app = express()

const { protocol, hostname, port } = url.parse(
  process.env.APP_URL || 'http://localhost:4000'
)

app.use(
  morgan('tiny', {
    skip (_req, _res) {
      return process.env.NODE_ENV === 'test'
    },
  })
)
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})
app.use(routes)

// const httpsServer = https.createServer(credentials, app);

if (!module.parent) {
  // httpsServer.listen(8443, () => console.log(`Server started at ${protocol}//${hostname}:${port}`));
  app.listen(port, () => console.log(`Server started at ${protocol}//${hostname}:${port}`))
}

// Export our app for testing purposes
module.exports = app
