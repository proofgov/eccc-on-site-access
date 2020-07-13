const path = require('path')

const { loadTimeSlotDefaults } = require(path.resolve(APP_ROOT + '/utils/helpers'))

class TimeSlotsController {
  static getTimeSlots (request, response) {
    console.log('request.url', request.url)

    response.type('application/json')
    response.status(200)
    response.send(loadTimeSlotDefaults())
  }
}

module.exports = TimeSlotsController
