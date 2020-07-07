// Entry point
const express = require('express')
const basicAuth = require('express-basic-auth')
const path = require('path')

global.APP_ROOT = Object.freeze(path.dirname(__filename))

const app = express()

const listenPort = 4000

const { requester, protocol, hostname, port } = require(path.resolve(
  APP_ROOT,
  'utils/helpers'
))

const DAYS = Object.freeze({
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
})

const HOURS = Object.freeze({
  '1': '8:00 am',
  '2': '9:00 am',
  '3': '10:00 am',
  '4': '11:00 am',
  '5': '12:00 pm',
  '6': '1:00 pm',
  '7': '2:00 pm',
  '8': '3:00 pm',
  '9': '4:00 pm',
  'NOON': 12,
})

// *************************
// Express Application Setup
// *************************

app.get('/', (req, res) =>
  res.send(
    "<h1>Welcome to PROOF's ECCC On Site Access API</h1>" +
      '<p>To read how to make an app like this, visit <a href="https://github.com/proofgov/example-form-query-api">Proof\'s github form query api example page.</a>'
  )
)

// building name, floor, request date and request time as parameters.
//Have it return "blocked" if the request is noon or Tuesday, otherwise it says accept.
app.get('/is-time-available', (request, response) => {
  console.log('request.url', request.url)
  console.log('request', request.query)
  const {
    building: buildingData,
    floor: queryFloor,
    date: queryDate,
    time: queryTime,
  } = request.query
  const floor = Number(queryFloor)

  const accessRequestedFor = new Date(`${queryDate} ${HOURS[queryTime]}`)

  console.log('building', buildingData)
  console.log('floor', floor)
  console.log('accessRequestedFor', accessRequestedFor)

  let data = {
    isAvailable: true,
    nextAvailableTimeSlot: null,
    info: 'Access is denied if date is a Tuesday (e.g. 2020/07/07), time=5 or floor=13.',
  }

  // const [province, building, branch, _rest] = buildingData.split(',')
  // data.isAvailable = store.checkAvailability(accessRequestedFor, { province, building, branch })
  // if (!data.isAvailable) {
  //   data.nextAvailableTimeSlot = store.nextAvailableTimeSlot(accessRequestedFor, { province, building, branch })
  // }

  if (
    accessRequestedFor.getDay() === DAYS.TUESDAY ||
    accessRequestedFor.getHours() === HOURS.NOON ||
    floor === 13
  ) {
    data.isAvailable = false
    data.nextAvailableTimeSlot = '2020/07/12 at 4 pm'
  }

  console.log(
    'response:',
    JSON.stringify(
      {
        status: 200,
        type: 'application/json',
        data: data,
      },
      null,
      2
    )
  )
  response.type('application/json')
  response.status(200)
  response.send(data)
})

app.listen(listenPort, () =>
  console.log(`API is listening at ${protocol}//${hostname}:${listenPort}`)
)
