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

  describe('#getAvailabilityPerDay', () => {
    describe('GET /available-days', () => {
      context('when retreiving date availablity', () => {
        def('nextAvailableDaysMock', () => td.replace(proofApi, 'nextAvailableDays'))
        def('getBuildingCapacityMock', () => td.replace(proofApi, 'getBuildingCapacity'))

        context('when api call succceds', () => {
          def('apiResponse', () => [
            {
              label: '13 (out of 55) appointments available on 2020-07-16',
              value: '2020-07-16',
            },
          ])

          context('when no date provided in the url', () => {
            beforeEach(() => {
              td.when(
                $nextAvailableDaysMock({
                  'location.province': 'Yukon',
                  'location.building': 'Yukon Weather Centre',
                  'request.date': moment().format('YYYY-MM-DD'),
                })
              ).thenResolve($apiResponse)
            })

            it('returns the next available dates', async () => {
              return request(app)
                .get(
                  '/available-days?' +
                    'location.province=Yukon&' +
                    'location.building=Yukon Weather Centre'
                )
                .then(response =>
                  expect(response.body.availableDays).to.deep.eq($apiResponse)
                )
            })
          })

          context('when date provided in url', () => {
            beforeEach(() => {
              td.when(
                $nextAvailableDaysMock({
                  'location.province': 'Yukon',
                  'location.building': 'Yukon Weather Centre',
                  'request.date': '2020-07-10',
                })
              ).thenResolve($apiResponse)
            })

            it('returns the next available dates', async () => {
              return request(app)
                .get(
                  '/available-days?' +
                    'location.province=Yukon&' +
                    'location.building=Yukon Weather Centre&' +
                    'request.date=2020-07-10'
                )
                .then(response =>
                  expect(response.body.availableDays).to.deep.eq($apiResponse)
                )
            })
          })
        })

        context('when missing required parameters', () => {
          it('returns a human readable error response', async () => {
            return request(app)
              .get('/available-days')
              .then(response =>
                expect(response.body.error).to.match(/^Missing required params/)
              )
          })

          it('returns a stock availability message', async () => {
            return request(app)
              .get('/available-days')
              .then(response =>
                expect(response.body.availableDays).to.deep.eq([
                  {
                    label:
                      'External API failure please report to the relevant authorities.',
                    value: moment().format('YYYY-MM-DD'),
                  },
                ])
              )
          })
        })

        context('when api calls fail', () => {
          context('availability lookup fails', () => {
            beforeEach(() => {
              td.when(
                $getBuildingCapacityMock({
                  province: 'Yukon',
                  building: 'Yukon Weather Centre',
                })
              ).thenReturn(9999)
              td.when(
                $nextAvailableDaysMock({
                  'location.province': 'Yukon',
                  'location.building': 'Yukon Weather Centre',
                  'request.date': moment().format('YYYY-MM-DD'),
                })
              ).thenThrow(new Error('Service unavailable ...'))
            })

            it('returns the an error message and the current date', async () => {
              return request(app)
                .get(
                  '/available-days?' +
                    'location.province=Yukon&' +
                    'location.building=Yukon Weather Centre'
                )
                .then(response =>
                  expect(response.body).to.deep.eq({
                    availableDays: [
                      {
                        label:
                          'External API failure please report to the relevant authorities.',
                        value: moment().format('YYYY-MM-DD'),
                      },
                    ],
                    buildingCapacity: 9999,
                    error: 'Service unavailable ...',
                    info:
                      'Access is denied if building capacity would be over 20% on a given day.',
                  })
                )
            })
          })
        })
      })
    })
  })

  describe('#getBuildingCapacity', () => {
    context('GET /building-capacity', () => {
      def('getBuildingCapacityMock', () => td.replace(proofApi, 'getBuildingCapacity'))

      context('when requesting building capacity information', () => {
        context('when successfull', () => {
          it('returns the correct data', () => {
            return request(app)
              .get(
                '/building-capacity?' +
                  'location.province=Yukon&' +
                  'location.building=Yukon Weather Centre'
              )
              .then(response =>
                expect(response.body).to.deep.eq({
                  allowedOccupancy: 4,
                  buildingCapacity: 19,
                  error: null,
                })
              )
          })
        })

        context('when argument is incorrect', () => {
          it('returns a readable error message', () => {
            return request(app)
              .get(
                '/building-capacity?' +
                  'location.province=Yukon&' +
                  'location.bad-argument=Yukon Weather Centre'
              )
              .then(response =>
                expect(response.body.error).to.match(/^Missing required params or values/)
              )
          })
        })

        context('when api lookup fails', () => {
          beforeEach(() => {
            td.when(
              $getBuildingCapacityMock({
                province: 'Yukon',
                building: 'Not a real building',
              })
            ).thenThrow(new Error('Building lookup failure ...'))
          })

          it('returns a readable error message', () => {
            return request(app)
              .get(
                '/building-capacity?' +
                  'location.province=Yukon&' +
                  'location.building=Not a real building'
              )
              .then(response =>
                expect(response.body).to.deep.eq({
                  allowedOccupancy: null,
                  buildingCapacity: null,
                  error: 'Building lookup failure ...',
                })
              )
          })
        })
      })
    })
  })
})
