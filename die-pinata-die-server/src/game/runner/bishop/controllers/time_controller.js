const context = require('../models/context')

const time = {
  start: Date.now(),
  end: 0,
  diff: 'h:0 s:0 ms:0',
}

function update() {
  context.getMainStats().time = time
  time.end = Date.now()
  const diff = time.end - time.start
  const s = diff / 1000
  const m = s / 60
  const h = m / 60
  time.diff = `h:${Math.floor(h * 100) / 100} m:${Math.floor(m * 100) / 100} s:${Math.floor(s * 100) / 100}`
}

module.exports = { update }
