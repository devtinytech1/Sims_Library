const { round } = require('../../../../../src/utils/math.cjs')
const baseSettings = require('../../../../red-panda-rising-server/src/game/runner/configs/settings')
const { getRandomItemByArrayWeights } = require('../../../../red-panda-rising-server/src/game/runner/math/random_controller')
const matrixController = require('../../../../red-panda-rising-server/src/game/runner/controllers/matrix_controller')

function setModel(client) {
  const model = client.getFeatures().collect = {
    mask: [],
    types: [],
    values: [],
    total: 0,
    win: 0,
    triggers: [],
  }
  client.getCollect = () => model
  return model
}

async function check(client, matrix) {
  const settings = baseSettings.get(client.gameId).features.collect
  const maskSym = matrixController.foundSymbols(matrix, settings.symbol)
  if (maskSym.length) {
    const featureModel = setModel(client)
    featureModel.mask = maskSym

    for (let i = 0; i < maskSym.length; i++) {
      const value = await getRandomItemByArrayWeights(client, settings.weights, settings.values)
      const amount = round(value * client.spinBet)
      featureModel.types.push(settings.values.indexOf(value))
      featureModel.values.push(amount)
      featureModel.win = round(featureModel.win + amount)
    }

    featureModel.triggers = matrixController.foundSymbols(matrix, settings.triggerSymbol)
    featureModel.triggers.forEach(() => featureModel.total = round(featureModel.total + featureModel.win))

    if (featureModel.total) {
      client.getFeatures().total = round(client.getFeatures().total + featureModel.total)
    }
  }
}

module.exports = { check }
