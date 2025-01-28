const { SHUTDOWNDURATION } = process.env
const duration = SHUTDOWNDURATION || 30
const interval = 1000

let active = 0

function inc() {
  active++
}

function dec() {
  active--
}

async function shutdown() {
  let left = Number(duration)
  return new Promise(function tick(resolve) {
    if (!--left || !active) {
      resolve(active)
    }
    else {
      setTimeout(() => tick(resolve), interval)
    }
  })
}

module.exports = { inc, dec, shutdown }
