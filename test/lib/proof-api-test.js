const fs = require('fs')
const path = require('path')

const axios = require('axios')

const proofApi = require(APP_ROOT + '/lib/proof-api')

describe('lib/proof-api', () => {
  describe('#checkAvailability', () => {
    def('getMock', () => td.replace(axios, 'get'))

    def('proofApiResponse', () => {
      const proofApiResponse = path.resolve(
        APP_ROOT,
        'dummy/proof_sumbissions_response.json'
      )
      try {
        return JSON.parse(fs.readFileSync(proofApiResponse, 'utf8'))
      } catch (error) {
        console.log(error)
      }
    })

    beforeEach(() => {
      td.when($getMock($queryUrl, $queryOptions)).thenResolve({ data: $proofApiResponse })
    })

    context('when passed a building name and date', () => {
      context('when building is less than 20% occupancy for that day', () => {
        def('allowedFilters', () => ({
          'location.province': 'Yukon',
          'location.building': 'Combined Services Bldg',
          'request.date': '2020/07/09',
        }))

        def(
          'queryUrl',
          () =>
            `${$PROOF_URL}/api/forms/1/submissions?` +
            'filters[location.province]=Yukon&' +
            'filters[location.building]=Combined Services Bldg&' +
            'filters[request.date]=2020/07/09'
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
        })

        afterEach(() => {
          delete process.env['FORM_CONFIG_ID']
          delete process.env['PROOF_URL']
          delete process.env['PROOF_API_TOKEN']
        })

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

      // context('when building is more than 20% occupancy for that day', () => {
      //   it('returns false', () => {

      //   })
      // })
    })
  })
})
