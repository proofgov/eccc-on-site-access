const fs = require('fs')
const path = require('path')

const axios = require('axios')

const proofApi = require(APP_ROOT + '/lib/proof-api')

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
      it('warns of missing args', async () => {
        const warnMock = td.replace(console, 'warn')

        await proofApi.checkAvailability({ invalid: 'args' })

        td.verify(warnMock(td.matchers.contains('Missing required params')))
      })

      it('returns true', async () => {
        console.warn = () => null // suppress warn, reset automatically.

        expect(
          await proofApi.checkAvailability({
            invalid: 'args',
          })
        ).to.be.false
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
})
