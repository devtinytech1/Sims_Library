
const mathUtils = require('../../../../../../../src/utils/math.cjs')
const baseSequences = require('../../configs/sequences')
const baseSettings = require('../../configs/settings')
const { KEY, TRIGGER } = require('../../../../../../../src/game/runner/configs/static.cjs')
const features = require('../features/features')
const { checkDefaultLines, getScatterWin } = require('../lines_controller')
const roundWin = require('../round_win_controller')
const { getRandomItemByArrayWeights } = require('../../math/random_controller.js')
const { scatterFeatureCheck } = require('../features/scatters_feature')

async function execute(client) {
  const settings = baseSettings.get(client.gameId)
  if (client.prevTrigger !== TRIGGER.SPIN) {
    return Promise.reject(KEY.INVALID_ACTION)
  }

  client.nextState = TRIGGER.SPIN
  client.nextTrigger = TRIGGER.SPIN
  client.node.spinTotal = 0
  client.roundBet = mathUtils.round(client.spinBet * settings.buyBonusMultiplier[client.request.params.index])
  client.matrix = await getMatrix(client, settings)

  features.init(client)

  checkDefaultLines(client, client.matrix)

  if (client.node.context.win.lines.length > 0) {
    client.node.context.win.lines.sort((a, b) => b.win - a.win)
  }
  scatterFeatureCheck(client, settings.features.spin)
  await roundWin.check(client)

  if (client.node.context.win.total > mathUtils.round(client.winCap * client.betMultiplier)) {
    client.node.context.win.total = mathUtils.round(client.winCap * client.betMultiplier)
  }
}

// generate matrix using stopped position
async function getMatrix(client, settings) {
  let matrixOption = []
  let sequences = baseSequences.get(client.gameId)["BuyOption_0"]
  let matrix = baseSequences.get(client.gameId)['MainBoard'][0]

  let bonusOption = 'buyBonusRandomMatrixIndex_0'

  const reelStopPostion = await getRandomItemByArrayWeights(client, settings[bonusOption].weights,
    settings[bonusOption].values)

  for (let reel = 0; reel < matrix.length; reel++) {
    let reelSymbols = []
    for (let row = 0; row < baseSettings.base.rows; row++) {
      let symbolpos = sequences[reel][reelStopPostion]
      let rowPos = symbolpos + row
      if (symbolpos + row >= matrix[reel].length) {
        rowPos = rowPos - matrix[reel].length
      }
      reelSymbols.push(matrix[reel][rowPos])
    }
    matrixOption.push(reelSymbols)
  }
  return matrixOption
}

module.exports = { execute }
