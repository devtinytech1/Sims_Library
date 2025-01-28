/* eslint no-console: 0 */
const log = require('gelf-pro')

const { LOGS_URL, LOGS_PORT } = process.env

log.setConfig({
  adapterOptions: {
    host: LOGS_URL,
    port: LOGS_PORT,
  },
})

const error = function () { }
const info = function () { }

const makeDebugLog = function () {
  return process.env.DEBUG === 'true' && process.env.ENVIRONMENT !== 'bishop' ?
    function (msg) {
      console.debug(msg)
    } :
    function () { }
}
const debug = makeDebugLog()

module.exports = { error, info, debug }
