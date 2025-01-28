async function health() {
  return { healthy: true }
}
const endpoints = { 'get|/actuator/health': health }

module.exports = { endpoints }
