const moment = require('moment')

// const submissions = require(APP_ROOT + '/dummy/proof_sumbissions_response.json')
const proofApi = require(APP_ROOT + '/lib/proof-api')

class AvailabilityController {
  static async getAvailability (request, response) {
    let isAvailable = false
    let nextAvailableTimeSlot = null
    try {
      isAvailable = await proofApi.checkAvailability({ ...request.query })
      if (!isAvailable) {
        nextAvailableTimeSlot = await proofApi.nextAvailableTimeSlot({ ...request.query })
      }
    } catch (error) {
      logger.error(error.message)
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

  static async getDays (request, response) {
    const { 'location.province': province, 'location.building': building } = request.query
    const buildingCapacity = proofApi.getBuildingCapacity({ province, building })

    let availableDays = [
      {
        label: 'External API failure please report to the relevant authorities.',
        value: moment().format('YYYY-MM-DD'),
      },
    ]
    try {
      availableDays = await proofApi.nextAvailableDays({ ...request.query })
    } catch (error) {
      logger.error(error.message)
    }

    response.type('application/json')
    response.status(200)
    response.send({
      availableDays,
      buildingCapacity,
      info: 'If building capacity would be over 20% on a given day access is denied.',
    })
  }
}

module.exports = AvailabilityController
