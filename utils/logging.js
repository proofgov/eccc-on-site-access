const helpers = {
  formatDate (date) {
    const Y = date.getFullYear()
    const m = date.getMonth() + 1
    const d = date.getDate()
    const H = date.getHours()
    const M = date.getMinutes()
    const S = date.getSeconds()

    return `${Y}-${m}-${d} ${H}:${M}:${S}`
  },
}

class Logger {
  static requestLogger (request, response, next) {
    const { method, originalUrl } = request
    const timestamp = helpers.formatDate(new Date())

    console.log(`[${timestamp}] ${method}: ${originalUrl}`)

    next()
  }
}

module.exports = Logger
