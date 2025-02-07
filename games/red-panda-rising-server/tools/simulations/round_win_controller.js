
const mathUtils = require('../../../../src/utils/math.cjs')
const features = require('../../src/game/runner/controllers/features/features')

async function check(client) {
  let win = client.getWinModel().total || 0
  if (win) {
    features.winType.check(client, win)
  }
  client.addSpinTotal(win || 0)
  return win
}

module.exports = { check }
