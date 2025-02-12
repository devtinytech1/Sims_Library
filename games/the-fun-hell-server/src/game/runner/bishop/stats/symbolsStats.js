
const mathUtils = require('../../../../../../../src/utils/math.cjs')

function check(lines, statsObjects) {
  lines.forEach(ln => {
    const len = ln.len,
      sym = ln.symbol
    statsObjects.forEach(statsBase => {
      statsBase[sym] || (statsBase[sym] = {})
      statsBase[sym][len] || (statsBase[sym][len] = { t: 0, c: 0, h: 0, r: 0, w: 0, avg: 0 })
      const model = statsBase[sym][len]
      model.t++
      model.c += ln.count
      model.w = mathUtils.round(model.w + ln.win)
    })
  })
}

function update(statsBase, spinCount) {
  Object.values(statsBase).forEach(symStats => Object.values(symStats).forEach(model => {
    model.h = mathUtils.round(spinCount / model.t)
    model.r = mathUtils.getRTP(model.w)
    model.avg = mathUtils.round(model.w / model.t)
  }))
}

module.exports = { check, update }
