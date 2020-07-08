const app = require(APP_ROOT + '/server')
const proofApi = require(APP_ROOT + '/lib/proof-api')

describe('isAvailable', () => {
  describe('GET /is-time-available', () => {
    context('when querying the /is-time-available api', () => {
      context('when no args passed', () => {
        def('checkAvailability', () => td.replace(proofApi, 'checkAvailability'))

        beforeEach(() => {
          console.info = () => {}
          console.warn = () => {}
          td.when($checkAvailability({})).thenThrow(new Error('Some Proof API error ...'))
        })

        afterEach(() => {
          console.info = ogInfoFunc
          console.warn = ogWarnFunc
          td.reset()
        })

        it('return that the time is available', () => {
          return request(app)
            .get('/is-time-available')
            .then(response => expect(response.body).to.include({ isAvailable: true }))
            .catch(function (err) {
              throw err
            })
        })

        it('always returns success', () => {
          return request(app)
            .get('/is-time-available')
            .then(response => expect(response.status).to.eq(200))
            .catch(function (err) {
              throw err
            })
        })
      })
    })
  })
})
