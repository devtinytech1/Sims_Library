
const baseSettings = require('../../configs/settings')
const { KEY, TRIGGER } = require('../../../../../../../src/game/runner/configs/static.cjs')
const features = require('../features/features')
const matrix = require('../matrix_controller')
const roundWin = require('../round_win_controller')
const { checkDefaultLines } = require('../lines_controller')
const mathUtils = require('../../../../../../../src/utils/math.cjs')
const { scatterFeatureCheck } = require('../features/scatters_feature')
           
async function execute(client) {
  const settings = baseSettings.get(client.gameId)
  if (client.prevTrigger !== TRIGGER.SPIN) {
    return Promise.reject(KEY.INVALID_ACTION)
  }
  client.roundBet = client.spinBet

  client.nextState = TRIGGER.SPIN
  client.nextTrigger = TRIGGER.SPIN
  client.node.spinTotal = 0

  features.init(client)
  features.mode.copy(client).decrease(client)

  client.matrix = await matrix.make(client, `${client.getMode ? 'mode' : ''}MainBoard`, baseSettings.base.rows)
  
  checkDefaultLines(client, client.matrix)
  
  if (client.node.context.win.lines.length > 0) {
    client.node.context.win.lines.sort((a, b) => b.win - a.win)
  }

  scatterFeatureCheck(client, settings.features.spin)

  roundWin.check(client)

   if (client.nextTrigger === TRIGGER.SPIN) {
    client.setGameRoundOver()
  }

  if (client.node.context.win.total > mathUtils.round(client.winCap * client.betMultiplier)) {
    client.node.context.win.total = mathUtils.round(client.winCap * client.betMultiplier)
  }
}

module.exports = { execute }
