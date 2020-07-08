// const submissions = require(APP_ROOT + '/dummy/proof_sumbissions_response.json')
const proofApi = require(APP_ROOT + '/lib/proof-api')

class AvailabilityController {
  static getAvailability (request, response) {
    console.info('request.url', request.url)
    console.info('request', request.query)

    let isAvailable
    try {
      isAvailable = proofApi.checkAvailability({ ...request.query })
    } catch (error) {
      isAvailable = true
      console.warn('proofApi failure:', error)
    }

    response.type('application/json')
    response.status(200)
    response.send({
      isAvailable: isAvailable,
      nextAvailableTimeSlot: null,
      info: 'Access is denied if date is a Tuesday (e.g. 2020/07/07), time=5 or floor=13.',
    })
  }
}

module.exports = AvailabilityController
