
const mathUtils = require('../../../../../../src/utils/math.cjs')
const baseSettings = require('../configs/settings.js')
const { TRIGGER } = require('../configs/static')
const features = require('./features/features')
const { scatterFeatureCheck } = require('./features/scatters_feature')

async function check(client) {
  const clientFeatures = client.getFeatures()
  const settings = baseSettings.get(client.gameId)
  let win = client.getWinModel().total || 0
  if (win) {
    features.winType.check(client, win)
  }
  clientFeatures.total && (win = mathUtils.round(win + clientFeatures.total))
  if (client.getMode) {
    const getMode = client.getMode()
    client.getMode().total = !getMode.isInitial ? mathUtils.round(win + client.getMode().total) : 0
  }
  client.nextState === TRIGGER.FREESPINS && (client.getFreespins().total = mathUtils.round(client.getFreespins().total + win))
  client.addSpinTotal(win || 0)
  client.nextTrigger === TRIGGER.SPIN && await scatterFeatureCheck(client, client.matrix, settings.features.spin, TRIGGER.SPIN, TRIGGER.SPIN)  // check a triggering of free game bonus feature 

  return win
}

module.exports = { check }
