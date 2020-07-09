// const submissions = require(APP_ROOT + '/dummy/proof_sumbissions_response.json')
const proofApi = require(APP_ROOT + '/lib/proof-api')

class AvailabilityController {
  static getAvailability (request, response) {
    console.info('request.url', request.url)
    console.info('request', request.query)

    let isAvailable = true
    let nextAvailableTimeSlot = null
    try {
      isAvailable = proofApi.checkAvailability({ ...request.query })
      if (!isAvailable) {
        nextAvailableTimeSlot = proofApi.nextAvailableTimeSlot({ ...request.query })
      }
    } catch (error) {
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
