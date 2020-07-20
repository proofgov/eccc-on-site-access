const axios = require('axios')

const helpers = {
  permitAllowedParams (allParams, allowedParams) {
    const params = {}
    Object.entries(allParams).forEach(([key, value]) => {
      if (!allowedParams.includes(key)) return
      if (!value) return

      params[key] = value
    })
    return params
  },
  requireParams (allParams, requiredParams) {
    const params = {}
    const missingParams = new Set(requiredParams)
    Object.entries(allParams).forEach(([key, value]) => {
      if (!requiredParams.includes(key)) return
      if (!value) return

      missingParams.delete(key)
      params[key] = value
    })

    if (missingParams.size > 0) {
      const missing = [...missingParams].map(key => `${key}=${allParams[key]}`).join(', ')
      throw new Error(`Missing required params or values ${missing}.`)
    }

    return params
  },
  buildEncodedFilters (paramData) {
    return Object.entries(paramData)
      .map(([key, value]) => `filters[${key}]=${encodeURI(value)}`)
      .join('&')
  },
  async fetchCurrentSubmissionData (paramData) {
    const { FORM_CONFIG_ID, PROOF_API_TOKEN, PROOF_URL } = process.env

    // Format is 'filters[location.province]=New Brunswick'
    const filterParams = helpers.buildEncodedFilters(paramData)

    return axios
      .get(`${PROOF_URL}/api/forms/${FORM_CONFIG_ID}/submissions?${filterParams}`, {
        headers: {
          Authorization: `Bearer ${PROOF_API_TOKEN}`,
        },
      })
      .then(response => {
        return response.data.data
      })
      .catch(error => {
        throw new Error(`PROOF api failure: ${error}`)
      })
  },
  // Fixes problems such as:
  // "Iqaluit" and "Iqaluit Upper Air Station" both being return by server query.
  convertServerQueryILikeToEquality (submissions, queryData) {
    return submissions.filter(submission => {
      return Object.keys(queryData).every(
        param => submission.data[param] == queryData[param]
      )
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

module.exports = {
  ...helpers,
}
