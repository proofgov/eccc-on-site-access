const moment = require('moment')

const proofApi = require(APP_ROOT + '/lib/proof-api')

class AvailabilityController {
  static async getAvailability (request, response) {
    let isAvailable = false
    let nextAvailableTimeSlot = null
    let errorMessage = null
    try {
      isAvailable = await proofApi.checkAvailability({ ...request.query })
      if (!isAvailable) {
        nextAvailableTimeSlot = await proofApi.nextAvailableTimeSlot({ ...request.query })
      }
    } catch (error) {
      logger.error(error.message)
      errorMessage = error.message
    }

    response.type('application/json')
    response.status(200)
    response.send({
      isAvailable,
      nextAvailableTimeSlot,
      info:
        'If building capacity is less than 10 people always allow.\n' +
        'If building capacity would be over 20% on a given day access is denied.\n',
      error: errorMessage,
    })
  }

  static async getAvailabilityPerDay (request, response) {
    let buildingCapacity = null
    let availableDays = [
      {
        label: 'External API failure please report to the relevant authorities.',
        value: moment().format('YYYY-MM-DD'),
      },
    ]
    let errorMessage = null
    try {
      const { 'location.province': province, 'location.building': building } = request.query
      buildingCapacity = proofApi.getBuildingCapacity({ province, building })
      availableDays = await proofApi.nextAvailableDays({ ...request.query })
    } catch (error) {
      logger.error(error.message)
      errorMessage = error.message
    }

    response.type('application/json')
    response.status(200)
    response.send({
      availableDays,
      buildingCapacity,
      info: 'Access is denied if building capacity would be over 20% on a given day.',
      error: errorMessage,
    })
  }
}

module.exports = AvailabilityController
