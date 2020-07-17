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

  static async getDays (request, response) {
    // const availableDays = await proofApi.nextAvailableDays({ ...request.query })
    const availableDays = [
      {
        label: `${moment().calendar()} has 110 slots available (of a total of 312)`,
        value: `${moment().format('YYYY-MM-DD')}`,
      },
      {
        label: `${moment().calendar()} has 7 slots available (of a total of 40)`,
        value: `${moment()
          .add(3, 'days')
          .format('YYYY-MM-DD')}`,
      },
      {
        label: `13 (out of 55) appointments available on ${moment()
          .add(7, 'days')
          .format('MMMM Do YYYY')}`,
        value: `${moment()
          .add(7, 'days')
          .format('YYYY-MM-DD')}`,
      },
    ]

    response.type('application/json')
    response.status(200)
    response.send({
      availableDays,
      info:
        'If building capacity is less than 10 people always allow.\n' +
        'If building capacity would be over 20% on a given day access is denied.\n',
    })
  }
}

module.exports = AvailabilityController
