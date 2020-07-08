const path = require('path')

const chai = require('chai')
const chaiHttp = require('chai-http')
const testdouble = require('testdouble')

chai.use(chaiHttp)

global.expect = chai.expect
global.request = chai.request
global.td = testdouble
global.APP_ROOT = Object.freeze(path.resolve(path.dirname(__filename) + '/../'))
global.ogInfoFunc = console.info
global.ogWarnFunc = console.warn
