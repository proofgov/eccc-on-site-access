// const submissions = require(APP_ROOT + '/dummy/proof_sumbissions_response.json')
const proofApi = require(APP_ROOT + '/lib/proof-api')

class AvailabilityController {
  static getAvailability (request, response) {
    console.info('request.url', request.url)
    console.info('request', request.query)

    let isAvailable
    let nextAvailableTimeSlot
    try {
      isAvailable = proofApi.checkAvailability({ ...request.query })
      nextAvailableTimeSlot = proofApi.nextAvailableTimeSlot({ ...request.query })
    } catch (error) {
      isAvailable = true
      nextAvailableTimeSlot = null
      console.warn('proofApi failure:', error)
    }

    response.type('application/json')
    response.status(200)
    response.send({
      isAvailable,
      nextAvailableTimeSlot,
      info: 'Access is denied if building capacity would be over 20% on a given day.',
    })
  }
}

module.exports = AvailabilityController
