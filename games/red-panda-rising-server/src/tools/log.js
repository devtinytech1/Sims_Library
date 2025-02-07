/* eslint no-console: 0 */
const log = require('gelf-pro')

const { LOGS_URL, LOGS_PORT, ENVIRONMENT } = process.env

log.setConfig({
  adapterOptions: {
    host: LOGS_URL,
    port: LOGS_PORT,
  },
})

function makelog(type) {
  if (process.env.ENVIRONMENT === 'bishop') {
    return () => { }
  }
  if (ENVIRONMENT && (
    ENVIRONMENT.toLowerCase() === 'dev' ||
    ENVIRONMENT.toLowerCase() === 'test' ||
    ENVIRONMENT.toLowerCase() === 'stage')) {
    return function (data) {
      const out = JSON.stringify(data)
      log[type](out)
      console.log(out)
    }
  }
  return function () { }
}

const error = makelog('error')
const info = makelog('info')

const makeDebugLog = function () {
  return process.env.DEBUG === 'true' && process.env.ENVIRONMENT !== 'bishop' ?
    function (msg) {
      console.debug(msg)
    } :
    function () { }
}
const debug = makeDebugLog()

module.exports = { error, info, debug }
