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
  permitAllowedParams (allFilters) {
    const filters = {}
    Object.entries(allFilters).forEach(([key, value]) => {
      if (!ALLOWED_PARAMS.includes(key)) return
      if (!value) return

      filters[key] = value
    })
    return filters
  },
  fetchCurrentSubmissionData (filters) {
    var axios = require('axios')

    const { FORM_CONFIG_ID, PROOF_API_TOKEN, PROOF_URL } = process.env

    // Format is 'filters[location.province]=New Brunswick'
    const filterParams = Object.entries(filters)
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
}

async function checkAvailability (queryParams) {
  const allowedFilters = helpers.permitAllowedParams(queryParams)
  const submissions = await helpers.fetchCurrentSubmissionData(allowedFilters)

  // if (submissions) console.log('submissions', submissions)

  // const accessRequestedFor = new Date(`${date} ${HOURS[time]}`)

  return false
}

function nextAvailableTimeSlot () {
  return '2020/07/12 at 4 pm'
}

module.exports = {
  checkAvailability,
  nextAvailableTimeSlot,
}
