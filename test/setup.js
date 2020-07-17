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

// allow restoring console functions
global.originalConsoleDebug = console.debug
global.originalConsoleLog = console.log
global.originalConsoleInfo = console.info
global.originalConsoleWarn = console.warn
global.originalConsoleError = console.error

// only include app once
global.app = require(APP_ROOT + '/server')

afterEach(() => {
  // Ensure testdouble is reset after each test
  td.reset()

  console.debug = originalConsoleDebug
  console.log = originalConsoleLog
  console.info = originalConsoleInfo
  console.warn = originalConsoleWarn
  console.error = originalConsoleError
})
