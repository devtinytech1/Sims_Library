
const mathUtils = require('../../../../../../src/utils/math.cjs')
const features = require('./features/features')

async function check(client) {
  const clientFeatures = client.getFeatures()
  let win = client.getWinModel().total || 0
  if (win) {
    features.winType.check(client, win)
  }
  clientFeatures.total && (win = mathUtils.round(win + clientFeatures.total))  
  client.addSpinTotal(win || 0)

  return win
}

module.exports = { check }
