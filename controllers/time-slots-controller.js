const path = require('path')

const { loadTimeSlotDefaults } = require(path.resolve(APP_ROOT + '/utils/helpers'))

class TimeSlotsController {
  static getTimeSlots (request, response) {
    console.log(`${request.method}: ${request.url}`)

    response.status(200).json({ availableTimeSlots: loadTimeSlotDefaults() })
  }
}

module.exports = TimeSlotsController
