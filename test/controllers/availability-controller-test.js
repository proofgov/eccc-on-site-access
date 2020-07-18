const moment = require('moment')

const proofApi = require(APP_ROOT + '/lib/proof-api')

describe('controllers/availability-controller', () => {
  describe('#getAvailability', () => {
    describe('GET /is-time-available', () => {
      context('when querying the /is-time-available api', () => {
        def('checkAvailability', () => td.replace(proofApi, 'checkAvailability'))
        def('nextAvailableTimeSlot', () => td.replace(proofApi, 'nextAvailableTimeSlot'))

        context('when no args passed', () => {
          beforeEach(() => {
            td.when($checkAvailability({})).thenThrow(new Error('Some Proof API error ...'))
            td.when($nextAvailableTimeSlot({})).thenThrow(
              new Error('Some Proof API error ...')
            )
          })

          it('return that the time not available', () => {
            return request(app)
              .get('/is-time-available')
              .then(response => expect(response.body).to.include({ isAvailable: false }))
          })

          it('always returns success', () => {
            return request(app)
              .get('/is-time-available')
              .then(response => expect(response.status).to.eq(200))
          })
        })

        context('when time is available', () => {
          beforeEach(() => {
            td.when($checkAvailability({})).thenResolve(true)
            td.when($nextAvailableTimeSlot({})).thenResolve('2020/07/12 at 4 pm')
          })

          it('does not send a nextAvailableTimeSlot', () => {
            return request(app)
              .get('/is-time-available')
              .then(response =>
                expect(response.body).to.include({ nextAvailableTimeSlot: null })
              )
          })
        })
      })
    })
  })

  describe('#getDays', () => {
    describe('GET /available-days', () => {
      context('when retreiving date availablity', () => {
        def('nextAvailableDaysMock', () => td.replace(proofApi, 'nextAvailableDays'))

        context('when api call succceds', () => {
          def('apiResponse', () => [
            {
              label: '13 (out of 55) appointments available on 2020/07/16',
              value: '2020/07/16',
            },
          ])

          beforeEach(() => {
            td.when($nextAvailableDaysMock({})).thenResolve($apiResponse)
          })

          it('returns the next available dates', async () => {
            return request(app)
              .get('/available-days')
              .then(response =>
                expect(response.body.availableDays).to.deep.eq($apiResponse)
              )
          })
        })

        context('when called', () => {
          def('apiResponse', () => 'whatever')

          beforeEach(() => {
            td.when($nextAvailableDaysMock({ key: 'value' })).thenResolve($apiResponse)
          })

          it('passes query args to api', async () => {
            return request(app)
              .get('/available-days?key=value')
              .then(response =>
                expect(response.body.availableDays).to.deep.eq($apiResponse)
              )
          })
        })

        context('when api call fails', () => {
          beforeEach(() => {
            td.when($nextAvailableDaysMock({})).thenThrow(
              new Error('Service unavailable ...')
            )
            console.warn = () => {} // reset automatically
          })

          it('returns the an error message and the current date', async () => {
            return request(app)
              .get('/available-days')
              .then(response =>
                expect(response.body.availableDays).to.deep.eq([
                  {
                    label: 'External API failure please report to ....',
                    value: moment().format('YYYY-MM-DD'),
                  },
                ])
              )
          })
        })
      })
    })
  })
})
