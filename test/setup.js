const path = require('path')

const chai = require('chai')
const chaiHttp = require('chai-http')
const testdouble = require('testdouble')

chai.use(chaiHttp)

global.expect = chai.expect

// allow mocking out apis
global.td = testdouble

// allow testing app endpoints
global.request = chai.request

// set up root directory for file lookup.
global.APP_ROOT = Object.freeze(path.resolve(path.dirname(__filename) + '/../'))

// only include app once
global.app = require(APP_ROOT + '/server')

afterEach(() => {
  // Ensure testdouble is reset after each test
  td.reset()
})
