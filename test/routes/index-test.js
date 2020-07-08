const axios = require('axios')

describe('routes/index (app root page)', () => {
  describe('GET /', () => {
    context('when hitting app root', () => {
      it('finds the welcome page', () => {
        return request(app)
          .get('/')
          .then(response => {
            expect(response.text).to.include('Welcome')
          })
      })
    })
  })
})
