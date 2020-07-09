const proofApi = require(APP_ROOT + '/lib/proof-api')

describe('isAvailable', () => {
  describe('GET /is-time-available', () => {
    context('when querying the /is-time-available api', () => {
      def('checkAvailability', () => td.replace(proofApi, 'checkAvailability'))
      def('nextAvailableTimeSlot', () => td.replace(proofApi, 'nextAvailableTimeSlot'))

      context('when no args passed', () => {
        beforeEach(() => {
          console.info = () => {}
          console.warn = () => {}
          td.when($checkAvailability({})).thenThrow(new Error('Some Proof API error ...'))
          td.when($nextAvailableTimeSlot({})).thenThrow(
            new Error('Some Proof API error ...')
          )
        })

        it('return that the time is available', () => {
          return request(app)
            .get('/is-time-available')
            .then(response => expect(response.body).to.include({ isAvailable: true }))
        })

        it('always returns success', () => {
          return request(app)
            .get('/is-time-available')
            .then(response => expect(response.status).to.eq(200))
        })
      })

      context('when time is available', () => {
        beforeEach(() => {
          td.when($checkAvailability({})).thenReturn(true)
          td.when($nextAvailableTimeSlot({})).thenReturn('2020/07/12 at 4 pm')
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
