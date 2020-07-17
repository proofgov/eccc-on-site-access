const path = require('path')
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
})
