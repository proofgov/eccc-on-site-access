const fs = require('fs')
const path = require('path')

const axios = require('axios')

const proofApi = require(APP_ROOT + '/lib/proof-api')
const helpers = require(APP_ROOT + '/lib/api-helpers')

describe('lib/proof-api', () => {
  def('fetchCurrentSubmissionDataMock', () =>
    td.replace(helpers, 'fetchCurrentSubmissionData')
  )

  describe('#checkAvailability', () => {
    def('building', () => 'Combined Services Bldg')
    def('perPage', () => 25)
    def('date', () => '2020-07-09')
    def('capacityResponse', () => [])

    beforeEach(() => {
      td.when(
        $fetchCurrentSubmissionDataMock(
          {
            'location.province': 'Yukon',
            'location.building': $building,
            'request.date': $date,
          },
          { perPage: $perPage }
        )
      ).thenResolve($capacityResponse)
    })

    context('when passed a building name and date', () => {
      context('when building is less than 20% occupancy for that day', () => {
        it('returns true', async () => {
          expect(
            await proofApi.checkAvailability({
              'location.province': 'Yukon',
              'location.building': $building,
              'request.date': $date,
              'request.time': '4',
            })
          ).to.be.true
        })
      })

      context('when building is more than 20% occupancy for that day', () => {
        def('capacityResponse', () =>
          JSON.parse(
            fs.readFileSync(path.resolve(APP_ROOT, 'dummy/over-capacity-data.json'), 'utf8')
          )
        )
        def('building', () => 'Yukon Weather Centre')
        def('date', () => '2020-07-10')

        def('perPage', () => 19)

        it('returns false', async () => {
          expect(
            await proofApi.checkAvailability({
              'location.province': 'Yukon',
              'location.building': $building,
              'request.date': $date,
              'request.time': '4',
            })
          ).to.be.false
        })
      })
    })

    context('when missing arguments', () => {
      it('raises an error', () => {
        return proofApi
          .checkAvailability({ invalid: 'args' })
          .then(() => expect.fail())
          .catch(error => {
            expect(error.message).to.match(/Missing required params/)
          })
      })
    })

    context('when proof server is down', () => {
      beforeEach(() => {
        td.when($fetchCurrentSubmissionDataMock(), { ignoreExtraArgs: true }).thenThrow(
          new Error('PROOF api failure')
        )
      })

      it('throws an error', async () => {
        return proofApi
          .checkAvailability({
            'location.province': 'Yukon',
            'location.building': 'Combined Services Bldg',
            'request.date': '2020-10-27',
          })
          .then(() => expect.fail())
          .catch(error => {
            expect(error.message).to.match(/PROOF api failure/)
          })
      })
    })
  })

  describe('#nextAvailableTimeSlot', () => {
    context('when looking for the next available time slot', () => {
      context('when next available day is the next day', () => {
        def('capacityResponse', () =>
          JSON.parse(
            fs.readFileSync(path.resolve(APP_ROOT, 'dummy/capacity-data.json'), 'utf8')
          )
        )

        def('currentDate', () => '2020-07-10')
        def('nextDay', () => '2020-07-11')

        beforeEach(() => {
          td.when(
            $fetchCurrentSubmissionDataMock(
              {
                'location.province': 'Yukon',
                'location.building': 'Yukon Weather Centre',
                'request.date': $nextDay,
              },
              td.matchers.anything()
            )
          ).thenResolve($capacityResponse)
        })

        it('returns the next day', async () => {
          expect(
            await proofApi.nextAvailableTimeSlot({
              'location.province': 'Yukon',
              'location.building': 'Yukon Weather Centre',
              'request.date': $currentDate,
              'request.time': '4',
            })
          ).to.eq($nextDay)
        })
      })
    })
  })

  describe('#getBuildingCapacity', () => {
    context('when passed a building and a province', () => {
      it('returns the allowed occupancy of the building', () => {
        expect(
          proofApi.getBuildingCapacity({
            province: 'Yukon',
            building: 'Yukon Weather Centre',
          })
        ).to.eq(19)
      })
    })
  })

  describe('#fetchOccupancyInfo', () => {
    context('when passed a province and building and date', () => {
      def('capacityResponse', () =>
        JSON.parse(
          fs.readFileSync(path.resolve(APP_ROOT, 'dummy/over-capacity-data.json'), 'utf8')
        )
      )
      def('yukonWeatherCenterCapacity', () => 19)

      beforeEach(() => {
        td.when(
          $fetchCurrentSubmissionDataMock(
            {
              'location.province': 'Yukon',
              'location.building': 'Yukon Weather Centre',
              'request.date': '2020-07-10',
            },
            { perPage: $yukonWeatherCenterCapacity }
          )
        ).thenResolve($capacityResponse)
      })

      it('returns the current occupancy of the building', () => {
        return proofApi
          .fetchOccupancyInfo({
            'location.province': 'Yukon',
            'location.building': 'Yukon Weather Centre',
            'request.date': '2020-07-10',
          })
          .then(response => expect(response).to.eq(8))
      })
    })
  })

  describe('#nextAvailableDays', () => {
    def('fetchCurrentSubmissionDataMock', () =>
      td.replace(helpers, 'fetchCurrentSubmissionData')
    )

    def('capacityResponse', () =>
      JSON.parse(
        fs.readFileSync(path.resolve(APP_ROOT, 'dummy/over-capacity-data.json'), 'utf8')
      )
    )

    def('yukonWeatherCenterCapacity', () => 19)
    /*
      Generate some dates
      dates = new Array(25)
      for (var i = 0; i < dates.length; i++) {
        dates[i] = moment('2020-07-10')
          .add(i, 'days')
          .format('YYYY-MM-DD')
      }
    */
    context('when looking for the next available date', () => {
      beforeEach(() => {
        td.when(
          $fetchCurrentSubmissionDataMock(
            {
              'location.province': 'Yukon',
              'location.building': 'Yukon Weather Centre',
              'request.date': '2020-07-10',
            },
            { perPage: $yukonWeatherCenterCapacity }
          )
        ).thenResolve($capacityResponse)
        ;[
          '2020-07-11',
          '2020-07-12',
          '2020-07-13',
          '2020-07-14',
          '2020-07-15',
          '2020-07-16',
        ].forEach(date => {
          td.when(
            $fetchCurrentSubmissionDataMock(
              {
                'location.province': 'Yukon',
                'location.building': 'Yukon Weather Centre',
                'request.date': date,
              },
              { perPage: $yukonWeatherCenterCapacity }
            )
          ).thenResolve([])
        })
      })

      it('returns an array', async () => {
        return proofApi
          .nextAvailableDays({
            'location.province': 'Yukon',
            'location.building': 'Yukon Weather Centre',
            'request.date': '2020-07-10',
          })
          .then(availableDays => expect(availableDays).to.be.an('array'))
      })

      it('return the correct number of available days', () => {
        return proofApi
          .nextAvailableDays(
            {
              'location.province': 'Yukon',
              'location.building': 'Yukon Weather Centre',
              'request.date': '2020-07-10',
            },
            { nDays: 3 }
          )
          .then(availableDays => expect(availableDays).to.have.lengthOf(3))
      })

      it('only makes calls corresponding to the lesser of nDays and maxRequests', () => {
        return proofApi
          .nextAvailableDays(
            {
              'location.province': 'Yukon',
              'location.building': 'Yukon Weather Centre',
              'request.date': '2020-07-11',
            },
            { nDays: 8, maxRequests: 4 }
          )
          .then(availableDays => expect(availableDays).to.have.lengthOf(4))
      })

      it('does not return a day if that day is unavailable', () => {
        return proofApi
          .nextAvailableDays({
            'location.province': 'Yukon',
            'location.building': 'Yukon Weather Centre',
            'request.date': '2020-07-10',
          })
          .then(availableDays => expect(availableDays[0].value).not.to.eq('2020-07-10'))
      })
    })
  })
})
