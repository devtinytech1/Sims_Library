const baseSettings = require('../../../src/game/runner/configs/settings.js')
const { getRandomItemByArrayWeights } = require('../../../../../src/game/runner/math/main_random_controller.cjs')
const { applyAllLinesMultiplier } = require('../../../src/game/runner/controllers/lines_controller.js')

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
