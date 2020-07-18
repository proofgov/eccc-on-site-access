const { Router } = require('express')
const AvailabilityController = require(APP_ROOT + '/controllers/availability-controller')
const TimeSlotsController = require(APP_ROOT + '/controllers/time-slots-controller')

const routes = Router()

// building name, floor, request date and request time as parameters.
routes.get('/available-time-slots', TimeSlotsController.getTimeSlots)
routes.get('/available-days', AvailabilityController.getDays)
routes.get('/is-time-available', AvailabilityController.getAvailability)

const allRoutePaths = routes.stack
  .map(r => {
    if (r.route && r.route.path) return r.route.path
  })
  .filter(Boolean)

if (process.env.NODE_ENV === 'development') {
  console.log('Paths:', allRoutePaths)
}

routes.get('/', (request, response) =>
  response.send(`
<h1>Welcome to PROOF's ECCC On Site Access API</h1>
<p>To read how to make an app like this, visit
  <a href="https://github.com/proofgov/example-form-query-api">Proof\'s github form query api example page.</a>
</p>
`)
)

module.exports = routes
