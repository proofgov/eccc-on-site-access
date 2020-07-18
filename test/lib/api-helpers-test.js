const fs = require('fs')
const path = require('path')

const axios = require('axios')

const helpers = require(path.resolve(APP_ROOT + '/lib/api-helpers'))

describe('lib/api-helpers', () => {
  describe('#requireParams', () => {
    context('when passed a list of params and required params', () => {
      it('returns only those params that are required', () => {
        expect(
          helpers.requireParams({ foo: 'bar', biz: 'baz', fiz: 'zif' }, ['foo', 'biz'])
        ).to.deep.eq({
          foo: 'bar',
          biz: 'baz',
        })
      })

      it('throws an error if require param is not present', () => {
        expect(() => helpers.requireParams({ biz: 'baz', fiz: 'zif' }, ['foo'])).to.throw(
          'foo'
        )
      })
    })
  })

  describe('#fetchCurrentSubmissionData', () => {
    def('getMock', () => td.replace(axios, 'get'))
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

    def(
      'queryUrl',
      () =>
        `${$PROOF_URL}/api/forms/1/submissions?` +
        'filters[location.province]=Yukon&' +
        'filters[location.building]=Combined Services Bldg&' +
        'filters[request.date]=2020/07/09'
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

    context('when passed various args', () => {
      it('returns returns the appropriate response', async () => {
        return helpers
          .fetchCurrentSubmissionData({
            'location.province': 'Yukon',
            'location.building': 'Combined Services Bldg',
            'request.date': '2020/07/09',
          })
          .then(response => expect(response).to.deep.eq($proofApiResponse.data))
      })
    })
  })
})
