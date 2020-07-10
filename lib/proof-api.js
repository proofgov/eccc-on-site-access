const fs = require('fs')
const path = require('path')

const axios = require('axios')
const yaml = require('js-yaml')

const { loadProvinceToBuildingToOccupancyMap } = require(path.resolve(
  APP_ROOT + '/utils/helpers'
))

const DAYS = Object.freeze({
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
})

const HOURS = Object.freeze({
  NOON: 12,
})

const ALLOWED_PARAMS = Object.freeze([
  'location.province',
  'location.building',
  'request.date',
])

const OCCUPANCY_MAP = Object.freeze(loadProvinceToBuildingToOccupancyMap())

const helpers = {
  permitAllowedParams (allParams) {
    const params = {}
    Object.entries(allParams).forEach(([key, value]) => {
      if (!ALLOWED_PARAMS.includes(key)) return
      if (!value) return

      params[key] = value
    })
    return params
  },
  fetchCurrentSubmissionData (paramData) {
    const { FORM_CONFIG_ID, PROOF_API_TOKEN, PROOF_URL } = process.env

    // Format is 'filters[location.province]=New Brunswick'
    const filterParams = Object.entries(paramData)
      .map(([key, value]) => `filters[${key}]=${value}`)
      .join('&')

    return axios
      .get(`${PROOF_URL}/api/forms/${FORM_CONFIG_ID}/submissions?${filterParams}`, {
        headers: {
          Authorization: `Bearer ${PROOF_API_TOKEN}`,
        },
      })
      .then(response => response.data.data)
      .catch(error => {
        console.log('PROOF api failure:', error)
        return []
      })
  },
  // Fixes problems such as:
  // "Iqaluit" and "Iqaluit Upper Air Station" both being return by server query.
  fixServerQueryILike (submissions, queryData) {
    return submissions.filter(submission => {
      return ALLOWED_PARAMS.every(param => submission.data[param] == queryData[param])
    })
  },
  formatDate (date) {
    dateToFormat = new Date(date)
    mm = ('0' + (new Date(date).getMonth() + 1)).slice(-2)
    dd = ('0' + new Date(date).getDate()).slice(-2)
    yyyy = new Date(date).getFullYear()
    formattedDate = yyyy + '-' + mm + '-' + dd
    return formattedDate
  },
  incrementDateString (dateString) {
    const day = new Date(dateString)
    const nextDay = new Date()
    nextDay.setDate(day.getDate() + 1)
    return helpers.formatDate(nextDay)
  },
}

//
// If building capacity is less than 10 people always allow.
// If number of occupancy requests is less than 20% of allowed occupancy allow.
// Otherwise denied the request.
async function checkAvailability (queryData) {
  // TODO: make this required params and return false if not specified?
  const allowedQueryData = helpers.permitAllowedParams(queryData)
  const { 'location.province': province, 'location.building': building } = allowedQueryData
  if (!province || !building) {
    console.warn(
      `Missing required params province: ${province} and/or building: ${building}`
    )
    return true
  }

  allowedOccupancy = OCCUPANCY_MAP[province][building]
  if (allowedOccupancy <= 10) return true

  const serverSubmissions = await helpers.fetchCurrentSubmissionData(allowedQueryData)
  const submissions = helpers.fixServerQueryILike(serverSubmissions, queryData)

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
    dateStr = incrementDateString(dateStr)
    queryDataForNextDay = { ...queryData, 'request.date': dateStr }
    i++
  } while (i < 14 && !(await checkAvailability({ ...queryDataForNextDay })))

  if (i == 14) return 'more than two weeks beyond the date you requested ...'

  return dateStr
}

module.exports = {
  checkAvailability,
  nextAvailableTimeSlot,
}
