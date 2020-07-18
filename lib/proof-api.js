const fs = require('fs')
const path = require('path')

const moment = require('moment')
const yaml = require('js-yaml')

const helpers = require(path.resolve(APP_ROOT + '/lib/api-helpers'))
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

function getBuildingCapacity (queryData) {
  const { province, building } = helpers.requireParams(queryData, ['province', 'building'])
  return OCCUPANCY_MAP[province][building]
}

async function fetchOccupancyInfo (queryData) {
  const params = helpers.requireParams(queryData, ALLOWED_PARAMS)

  const serverSubmissions = await helpers.fetchCurrentSubmissionData(params)
  const submissions = helpers.convertServerQueryILikeToEquality(serverSubmissions, params)

  return submissions.length
}

async function nextAvailableDays (queryData) {
  const params = helpers.requireParams(queryData, ALLOWED_PARAMS)
  let {
    'location.province': province,
    'location.building': building,
    'request.date': formattedDate,
  } = params

  const allowedOccupancy = getBuildingCapacity({ province, building })
  const availableDays = []
  let i = 0
  do {
    formattedDate = moment(formattedDate)
      .add(i, 'days')
      .format('YYYY-MM-DD')
    let currentOccupancy = await fetchOccupancyInfo({
      ...params,
      'request.date': formattedDate,
    })

    let plural = (currentOccupancy = 1 ? 's' : '')
    if (currentOccupancy < Math.ceil(allowedOccupancy * 0.2)) {
      availableDays.push({
        label: `${currentOccupancy} appointment${plural} available on ${formattedDate}`,
        value: formattedDate,
      })
    }

    i++
  } while (availableDays.length < 6 || i < 25)

  return availableDays
}

module.exports = {
  checkAvailability,
  fetchOccupancyInfo,
  getBuildingCapacity,
  nextAvailableTimeSlot,
  nextAvailableDays,
}
