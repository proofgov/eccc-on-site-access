const fs = require('fs')
const http = require('http')
const https = require('https')
const path = require('path')
const url = require('url')
const yaml = require('js-yaml')

const { PROOF_URL } = process.env
const { protocol, hostname, port } = url.parse(PROOF_URL || '')

function loadTimeSlotDefaults () {
  const timeSlotsPath = path.resolve(APP_ROOT, 'data/time_slots.yml')

  try {
    return yaml.safeLoad(fs.readFileSync(timeSlotsPath, 'utf8'))
  } catch (error) {
    console.log(error)
  }
}

function selectRequestLibrary () {
  return protocol === 'https:' ? https : http
}

function loadProvinceToBuildingToOccupancyMap () {
  const buildingOccupancyPath = path.resolve(
    APP_ROOT,
    'data/province_to_buildings_to_occupancy.yml'
  )

  try {
    return yaml.safeLoad(fs.readFileSync(buildingOccupancyPath, 'utf8'))
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  loadTimeSlotDefaults,
  loadProvinceToBuildingToOccupancyMap,
  requester: selectRequestLibrary(),
  protocol,
  hostname,
  port,
}
