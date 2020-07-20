const moment = require('moment')

const proofApi = require(APP_ROOT + '/lib/proof-api')
const apiHelpers = require(APP_ROOT + '/lib/api-helpers')

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
    const formattedCurrentDate = moment().format('YYYY-MM-DD')
    let buildingCapacity = null
    let availableDays = [
      {
        label: 'External API failure please report to the relevant authorities.',
        value: formattedCurrentDate,
      },
    ]
    let errorMessage = null
    try {
      const allowedParams = apiHelpers.permitAllowedParams(request.query, [
        'location.province',
        'location.building',
        'request.date',
      ])
      const params = apiHelpers.requireParams(allowedParams, [
        'location.province',
        'location.building',
      ])

      const { 'location.province': province, 'location.building': building } = params
      buildingCapacity = proofApi.getBuildingCapacity({ province, building })

      availableDays = await proofApi.nextAvailableDays({
        ...params,
        'request.date': allowedParams['request.date'] || formattedCurrentDate,
      })
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

  static async getBuildingCapacity (request, response) {
    let buildingCapacity = null
    let errorMessage = null
    let allowedOccupancy = null
    try {
      const params = apiHelpers.requireParams(request.query, [
        'location.province',
        'location.building',
      ])
      const { 'location.province': province, 'location.building': building } = params
      buildingCapacity = proofApi.getBuildingCapacity({ province, building })
      allowedOccupancy = Math.ceil(buildingCapacity * 0.2)
    } catch (error) {
      logger.error(error.message)
      errorMessage = error.message
    }

    response.json({
      buildingCapacity,
      allowedOccupancy,
      error: errorMessage,
    })
  }
}

module.exports = AvailabilityController
