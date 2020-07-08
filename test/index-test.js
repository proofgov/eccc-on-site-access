const axios = require('axios')

describe('index.js', () => {
  describe('#app', () => {
    context('when querying the /is-time-available api', () => {
      context('when no args passed', () => {
        it('return that the time is available', () => {
          return axios
            .get('http://app:4000/is-time-available')
            .then(response => expect(response.data).to.include({ isAvailable: true }))
        })

        it('always returns success', () => {
          return axios
            .get('http://app:4000/is-time-available')
            .then(response => expect(response.status).to.eq(200))
        })
      })
    })

    context('when hitting app root', () => {
      it('finds the welcome page', () => {
        return axios
          .get('http://app:4000')
          .then(response => expect(response.data).to.include('Welcome'))
      })
    })
  })
})
