const DAYS = Object.freeze({
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
})

const HOURS = Object.freeze({
  NOON: 12,
})

function checkAvailability ({ province, building, branch, floor, date, time }) {
  const accessRequestedFor = new Date(`${date} ${HOURS[time]}`)

  if (
    accessRequestedFor.getDay() === DAYS.TUESDAY ||
    accessRequestedFor.getHours() === HOURS.NOON ||
    floor === 13
  ) {
    return false
  }
  return true
}

function nextAvailableTimeSlot () {
  return '2020/07/12 at 4 pm'
}

module.exports = {
  checkAvailability,
  nextAvailableTimeSlot,
}
