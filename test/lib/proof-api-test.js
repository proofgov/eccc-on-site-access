const fs = require('fs')
const path = require('path')

const axios = require('axios')

const proofApi = require(APP_ROOT + '/lib/proof-api')
const helpers = require(APP_ROOT + '/lib/api-helpers')

describe('lib/proof-api', () => {
  def('getMock', () => td.replace(axios, 'get'))

  describe('#checkAvailability', () => {
    def('proofApiResponse', () =>
      JSON.parse(
        fs.readFileSync(
          path.resolve(APP_ROOT, 'dummy/proof_sumbissions_response.json'),
          'utf8'
        )
      )
    )

    def('queryOptions', () => ({
      headers: {
        Authorization: `Bearer ${$PROOF_API_TOKEN}`,
      },
    }))

    def('PROOF_URL', () => 'http://localhost:3000')
    def(
      'PROOF_API_TOKEN',
      () => 'b133f59e0cb56932a6c7ea0a239dbbcbf5ec7020f5e5851bfe2c88469d56b0f4'
    )

    beforeEach(() => {
      process.env['FORM_CONFIG_ID'] = 1
      process.env['PROOF_URL'] = $PROOF_URL
      process.env['PROOF_API_TOKEN'] = $PROOF_API_TOKEN

      td.when($getMock($queryUrl, $queryOptions)).thenResolve({ data: $proofApiResponse })
    })

    afterEach(() => {
      delete process.env['FORM_CONFIG_ID']
      delete process.env['PROOF_URL']
      delete process.env['PROOF_API_TOKEN']
    })

    context('when passed a building name and date', () => {
      context('when building is less than 20% occupancy for that day', () => {
        def(
          'queryUrl',
          () =>
            `${$PROOF_URL}/api/forms/1/submissions?` +
            'filters[location.province]=Yukon&' +
            'filters[location.building]=Combined Services Bldg&' +
            'filters[request.date]=2020/07/09'
        )

        it('returns true', async () => {
          expect(
            await proofApi.checkAvailability({
              'location.province': 'Yukon',
              'location.building': 'Combined Services Bldg',
              'request.date': '2020/07/09',
              'request.time': '4',
            })
          ).to.be.true
        })
      })

      context('when building is more than 20% occupancy for that day', () => {
        def('proofApiResponse', () =>
          JSON.parse(
            fs.readFileSync(
              path.resolve(APP_ROOT, 'dummy/proof_sumbissions_over_capacity_response.json'),
              'utf8'
            )
          )
        )

        beforeEach(() => {
          td.when($getMock(), { ignoreExtraArgs: true }).thenResolve({
            data: $proofApiResponse,
          })
        })

        it('returns false', async () => {
          expect(
            await proofApi.checkAvailability({
              'location.province': 'Yukon',
              'location.building': 'Yukon Weather Centre',
              'request.date': '2020-07-10',
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
        td.when($getMock(), { ignoreExtraArgs: true }).thenThrow(
          new Error('PROOF api failure')
        )
      })

      it('throws an error', async () => {
        return proofApi
          .checkAvailability({
            'location.province': 'Yukon',
            'location.building': 'Combined Services Bldg',
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
        def('proofApiTimeSlotAvailableResponse', () =>
          JSON.parse(
            fs.readFileSync(
              path.resolve(APP_ROOT, 'dummy/proof_sumbissions_response.json'),
              'utf8'
            )
          )
        )

        beforeEach(() => {
          td.when(
            $getMock(td.matchers.contains('2020-07-11'), td.matchers.anything())
          ).thenResolve({
            data: $proofApiTimeSlotAvailableResponse,
          })
        })

        it('returns the next day', async () => {
          expect(
            await proofApi.nextAvailableTimeSlot({
              'location.province': 'Yukon',
              'location.building': 'Yukon Weather Centre',
              'request.date': '2020-07-10',
              'request.time': '4',
            })
          ).to.eq('2020-07-11')
        })
      })
    })
  })

  describe('#fetchOccupancyInfo', () => {
    context('when passed a province and building', () => {
      def('fetchCurrentSubmissionDataMock', () =>
        td.replace(helpers, 'fetchCurrentSubmissionData')
      )

      def('capacityResponse', () =>
        JSON.parse(
          fs.readFileSync(path.resolve(APP_ROOT, 'dummy/capacity-data.json'), 'utf8')
        )
      )

      beforeEach(() => {
        td.when(
          $fetchCurrentSubmissionDataMock({
            'location.province': 'Yukon',
            'location.building': 'Yukon Weather Centre',
            'request.date': '2020-07-10',
          })
        ).thenResolve($capacityResponse)
      })

      it('returns the allowed occupancy of the building', async () => {
        return proofApi
          .fetchOccupancyInfo({
            'location.province': 'Yukon',
            'location.building': 'Yukon Weather Centre',
            'request.date': '2020-07-10',
          })
          .then(response => expect(response).to.have.property('allowed', 19))
      })

      it('returns the current occupancy of the building', () => {
        return proofApi
          .fetchOccupancyInfo({
            'location.province': 'Yukon',
            'location.building': 'Yukon Weather Centre',
            'request.date': '2020-07-10',
          })
          .then(response => expect(response).to.have.property('current', 8))
      })
    })
  })

  describe('#nextAvailableDays', () => {
    def('fetchCurrentSubmissionDataMock', () =>
      td.replace(helpers, 'fetchCurrentSubmissionData')
    )

    def('capacityResponse', () =>
      JSON.parse(
        fs.readFileSync(path.resolve(APP_ROOT, 'dummy/capacity-data.json'), 'utf8')
      )
    )

    context('when looking for the next available date', () => {
      beforeEach(() => {
        td.when(
          $fetchCurrentSubmissionDataMock({
            'location.province': 'Yukon',
            'location.building': 'Yukon Weather Centre',
            'request.date': '2020-07-10',
          })
        ).thenResolve($capacityResponse)
      })

      it('returns an array', async () => {
        return proofApi
          .nextAvailableDays({
            'location.province': 'Yukon',
            'location.building': 'Yukon Weather Centre',
            'request.date': '2020-07-10',
          })
          .then(response => expect(response).be.an('array'))
      })
    })
  })
})
