const baseSettings = require('../../configs/settings.js')
const { getRandomItemByArrayWeights } = require('../../math/random_controller')
const { applyAllLinesMultiplier } = require('../lines_controller')

function setMultiplierModel(currentContext, value) {
  if (!currentContext.features) {
    currentContext.features = { total: 0 }
  }
  currentContext.features.randomMultiplier = value
  if (value > 1) {
    applyAllLinesMultiplier(currentContext, value)
  }
}

async function executeRandomMultiplierFeature(client) {
  const settings = baseSettings.get(client.gameId)
  if (client.node.context.win?.total) {
    setMultiplierModel(client.node.context, await getRandomItemByArrayWeights(client,
      settings.features.randomMultiplier.weights, settings.features.randomMultiplier.values))
  }
}

module.exports = { executeRandomMultiplierFeature }
