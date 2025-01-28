
const context = require('../models/context')
const settings = require('../settings/bishopSettings')
const { getRTP, round } = require('../utils/math')

function saveLinesStats(lines, statsObjects) {
  lines.forEach(ln => {
    const len = ln.id ? settings.linesLength(ln) : ln.len
    const sym = ln.symbol
    statsObjects.forEach(statsBase => {
      if (!statsBase[sym]) {
        statsBase[sym] = {}
      }
      if (!statsBase[sym][len]) {
        statsBase[sym][len] = { c: 0, h: 0, r: 0, w: 0 }
      }
      statsBase[sym][len].c++
      statsBase[sym][len].h = round(context.stats.iteration / statsBase[sym][len].c, 10)
      statsBase[sym][len].w = round(statsBase[sym][len].w + ln.win, 10000)
      statsBase[sym][len].r = getRTP(statsBase[sym][len].w)
    })
  })
}

module.exports = saveLinesStats
