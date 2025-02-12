
const { KEY, TRIGGER } = require('../../configs/static')
const features = require('../features/features')
const mathUtils = require('../../../../../../../src/utils/math.cjs')
const roundWin = require('../round_win_controller')
const { makeWinModel } = require('../lines_controller')

async function execute(client) {
  if (client.prevTrigger !== TRIGGER.BONUS) {
    return Promise.reject(KEY.INVALID_ACTION)
  }

  client.nextState = TRIGGER.BONUS
  client.nextTrigger = TRIGGER.BONUS_END

  client.matrix = client.lastResponse.context.matrix

  features.init(client)
  await features.wheel.check(client, client.matrix)

  makeWinModel(client, client.node.context)
  roundWin.check(client)

  if (client.node.context.features.total > mathUtils.round(client.winCap * client.betMultiplier)) {
    client.node.context.features.total = mathUtils.round(client.winCap * client.betMultiplier)
  }

}

module.exports = { execute }
