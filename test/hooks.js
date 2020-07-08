// test/hooks.js

exports.mochaHooks = {
  // do something after every test
  afterEach (done) {
    // Ensure testdouble is reset after each test
    td.reset()
    done()
  },
}
