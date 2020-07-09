// const submissions = require(APP_ROOT + '/dummy/proof_sumbissions_response.json')
const proofApi = require(APP_ROOT + '/lib/proof-api')

class AvailabilityController {
  static async getAvailability (request, response) {
    console.info('request.url', request.url)
    console.info('request', request.query)

    let isAvailable = true
    let nextAvailableTimeSlot = null
    try {
      isAvailable = await proofApi.checkAvailability({ ...request.query })
      if (!isAvailable) {
        nextAvailableTimeSlot = await proofApi.nextAvailableTimeSlot({ ...request.query })
      }
    } catch (error) {
      console.warn('proofApi failure:', error)
    }

    response.type('application/json')
    response.status(200)
    response.send({
      isAvailable,
      nextAvailableTimeSlot,
      info:
        'If building capacity is less than 10 people always allow.\n' +
        'If building capacity would be over 20% on a given day access is denied.\n',
    })
  }
}

module.exports = AvailabilityController
