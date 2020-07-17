const fs = require('fs')
const path = require('path')

const yaml = require('js-yaml')

const helpers = require(path.resolve(APP_ROOT + '/lib/proof-api-helpers'))
const { loadProvinceToBuildingToOccupancyMap } = require(path.resolve(
  APP_ROOT + '/utils/helpers'
))

const ALLOWED_PARAMS = Object.freeze([
  'location.province',
  'location.building',
  'request.date',
])

const OCCUPANCY_MAP = Object.freeze(loadProvinceToBuildingToOccupancyMap())

//
// If building capacity is less than 10 people always allow.
// If number of occupancy requests is less than 20% of allowed occupancy allow.
// Otherwise denied the request.
async function checkAvailability (queryData) {
  // TODO: make this required params and return false if not specified?
  const allowedQueryData = helpers.permitAllowedParams(queryData, ALLOWED_PARAMS)
  const { 'location.province': province, 'location.building': building } = allowedQueryData
  if (!province || !building) {
    throw new Error(
      `Missing required params province: ${province} and/or building: ${building}`
    )
  }

  allowedOccupancy = OCCUPANCY_MAP[province][building]
  if (allowedOccupancy <= 10) return true

  const serverSubmissions = await helpers.fetchCurrentSubmissionData(allowedQueryData)
  const submissions = helpers.convertServerQueryILikeToEquality(
    serverSubmissions,
    allowedQueryData
  )

  numberOfOccupancyRequests = submissions.length
  if (numberOfOccupancyRequests < Math.ceil(allowedOccupancy * 0.2)) return true

  return false
}

// run checkAvailability on successive days until a date is available.
async function nextAvailableTimeSlot (queryData) {
  let { 'request.date': dateStr } = queryData

  let queryDataForNextDay = {}
  var i = 0
  do {
    dateStr = helpers.incrementDateString(dateStr)
    queryDataForNextDay = { ...queryData, 'request.date': dateStr }
    i++
  } while (i < 14 && !(await checkAvailability({ ...queryDataForNextDay })))

  if (i == 14) return 'more than two weeks beyond the date you requested ...'

  return dateStr
}

async function nextAvailableDays (queryData) {
}

module.exports = {
  checkAvailability,
  nextAvailableTimeSlot,
  nextAvailableDays,
}
