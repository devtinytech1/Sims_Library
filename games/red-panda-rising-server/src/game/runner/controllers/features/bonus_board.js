const mathUtils = require('../../../../../../../src/utils/math.cjs')
const baseSettings = require('../../configs/settings')
const ways = require('../lines_controller')
const matrix = require('../matrix_controller')

function getModel(client) {
  const model = client.getFeatures().additionalBoard = {
    matrix: [],
    // compose: [],
  }
  client.getAdditionalBoard = () => model
  return model
}
async function check(client) {
  if (client.getMode) {
    const model = getModel(client)
    model.matrix = await matrix.make(client, `${client.nextState}BonusBoard`, baseSettings.base.bonus_rows)
    // model.compose = [...client.matrix, ...model.matrix]
  }
}

function checkWin(client) {
  if (client.getAdditionalBoard && client.getMode && !client.getMode().isInitial) {
    const winModelOld = client.getWinModel()
    ways.checkWays(client, client.getRandomWild().additionalMatrix)
    const winModel = client.getWinModel()
    const baseReelsCount = client.matrix.length
    winModel.lines.forEach(line => line.mask.forEach(mask => mask[0] += baseReelsCount))
    winModel.lines.push(...winModelOld.lines)
    winModel.total = mathUtils.round(winModel.total + winModelOld.total)
  }
}

function copy(client) {
  const data = client.prevContext.features.mode
  if (data && data.left) {
    client.getFeatures().mode = {
      total: data.total,
      add: 0,
      all: data.all,
      left: data.left,
      mask: [],
    }
    client.getMode = () => client.getFeatures().mode
  }
  return this
}

module.exports = { check, copy, checkWin }
