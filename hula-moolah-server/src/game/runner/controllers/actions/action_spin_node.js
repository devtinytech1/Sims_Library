const baseSettings = require('../../configs/settings.js')
const { round } = require('../../../../utils/math.js')
const { triggers } = require('../../configs/triggers')
const { scatterFeatureCheck } = require('../features/scatters_feature')
const { holdnspinFeatureCheck } = require('../features/holdnspin_feature')
const { check576Lines } = require('../lines_controller')
const { getMatrix } = require('../matrix_controller')
const { checkRoundWin } = require('../round_win_controller')
const { checkMetamorphicMatrix } = require('../features/metamorphic_feature.js')

module.exports.execute = async function (client) {

  if (client.lastResponse.trigger !== triggers.spin) {
    return Promise.reject('invalid_action')
  }
  client.node.state = triggers.spin
  client.node.trigger = triggers.spin
  client.node.spinTotal = 0

  client.node.context.matrix = await getMatrix(client, triggers.spin, baseSettings.base.rows)
  client.node.context.matrix[0][0] = 'X'
  client.node.context.matrix[4][0] = 'X'

  const positionsOfW = [];
  client.node.context.matrix.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if(value === 'W'){
        positionsOfW.push([rowIndex, colIndex]);
      }
    });
  });

  client.node.context.WildPresent = positionsOfW


  const settings = baseSettings.get(client.gameId)

  const flattenedMatrix = client.node.context.matrix.flat();
  var isWildPresent = flattenedMatrix.includes('W');

  if (isWildPresent) {
    var isMetamorphic = await checkMetamorphicMatrix(client, client.node.context.matrix)
  }

  check576Lines(client)

  //Arrage the win lines as per descending win value.
  if (client.node.context.win.lines.length > 0) {
    client.node.context.win.lines.sort((a, b) => b.win - a.win)
  }

  if (client.node.context.win.total < round(client.winCap * client.betMultiplier)) {
    var isHoldnspinTriggered = false
    const triggerWin = client.node.context.win.total
    if (isWildPresent) {
      isHoldnspinTriggered = await holdnspinFeatureCheck(client, settings.features.holdnspin, triggers.spin, triggers.spin, triggerWin)
    }

    scatterFeatureCheck(client, client.node.context.matrix, settings.features.spin, triggers.spin, triggers.spin, isHoldnspinTriggered)
  }

  checkRoundWin(client)

  //winCap
  if (client.node.context.win.total >= round(client.winCap * client.betMultiplier)) {
    client.node.context.win.total = round(client.winCap * client.betMultiplier)
  }

  if (client.request.action === triggers.spin) {
    client.roundBet = client.spinBet
  }
  if (client.node.trigger === triggers.spin) {
    client.setGameRoundOver()
  }
}
