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
    var axios = require('axios')

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
      })
  },
  // Fixes problems such as:
  // "Iqaluit" and "Iqaluit Upper Air Station" both being return by server query.
  fixServerQueryILike (submissions, queryData) {
    return submissions.filter(submission => {
      return ALLOWED_PARAMS.every(param => submission[param] == queryData[param])
    })
  },
}

//
// If building capacity is less than 10 people always allow.
// If number of occupancy requests is less than 20% of allowed occupancy allow.
// Otherwise denied the request.
async function checkAvailability (queryData) {
  const allowedQueryData = helpers.permitAllowedParams(queryData)

  const { 'location.province': province, 'location.building': building } = allowedQueryData

  allowedOccupancy = OCCUPANCY_MAP[province][building]
  if (allowedOccupancy <= 10) return true

  const serverSubmissions = await helpers.fetchCurrentSubmissionData(allowedQueryData)
  const submissions = helpers.fixServerQueryILike(serverSubmissions, queryData)

  numberOfOccupancyRequests = submissions.length
  if (numberOfOccupancyRequests < Math.ceil(allowedOccupancy * 0.2)) return true

  return false
}

function nextAvailableTimeSlot () {
  return '2020/07/12 at 4 pm (demo response)'
}

module.exports = {
  checkAvailability,
  nextAvailableTimeSlot,
}
