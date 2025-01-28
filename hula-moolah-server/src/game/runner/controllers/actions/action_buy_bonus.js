const { triggers } = require('../../configs/triggers')
const baseSettings = require('../../configs/settings')
const mathUtils = require('../../../../utils/math')
const baseSequences = require('../../configs/sequences')
const { getRandomItemByArrayWeights, getRandomInt } = require('../../math/random_controller.js')
const { scatterFeatureCheck } = require('../features/scatters_feature')
const { holdnspinFeatureCheck } = require('../features/holdnspin_feature')
const { checkRoundWin } = require('../round_win_controller')
const { check576Lines } = require('../lines_controller')
const { round } = require('../../../../utils/math.js')

module.exports.execute = async function (client) {
  const settings = baseSettings.get(client.gameId)
  if (client.lastResponse.trigger !== triggers.spin) {
    return Promise.reject('invalid_action')
  }
  client.node.state = triggers.spin
  client.node.trigger = triggers.spin
  client.node.spinTotal = 0
  client.roundBet = mathUtils.round(client.spinBet * settings.buyBonusMultiplier[client.request.params.index])

  client.node.context.matrix = await getMatrix(client, settings)
  client.node.context.matrix[0][0] = 'X'
  client.node.context.matrix[4][0] = 'X'

  const positionsOfW = [];
  client.node.context.matrix.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (value === 'W') {
        positionsOfW.push([rowIndex, colIndex]);
      }
    });
  });

  client.node.context.WildPresent = positionsOfW

  check576Lines(client)

  //Arrage the win lines as per descending win value.
  if (client.node.context.win.lines.length > 0) {
    client.node.context.win.lines.sort((a, b) => b.win - a.win)
  }

  const triggerWin = client.node.context.win.total
  var isHoldnspinTriggered = false
  if (client.request.params.index === 0) {
    holdnspinFeatureCheck(client, settings.features.holdnspin, triggers.spin, triggers.spin, triggerWin)
  } else if (client.request.params.index === 1) {
    scatterFeatureCheck(client, client.node.context.matrix, settings.features.spin, triggers.spin, triggers.spin, isHoldnspinTriggered)
  }

  checkRoundWin(client)

  //winCap
  if (client.node.context.win.total >= round(client.winCap * client.betMultiplier)) {
    client.node.context.win.total = round(client.winCap * client.betMultiplier)
  }
}


// generate matrix using stopped position
async function getMatrix(client, settings) {
  let matrixOption = [];
  let sequences = [];
  let selectedOption = 0;

  if (client.request.params.index === 0) {
    sequences = baseSequences.get(client.gameId)["BuyOption_" + client.request.params.index];
  } else if (client.request.params.index === 1) {
    let sequencesOption = baseSequences.get(client.gameId)["BuyOption_" + client.request.params.index];
    selectedOption = await getRandomItemByArrayWeights(client, settings.reelsSet['BuyOption_1_Prob'], settings.reelsSet['BuyOption_1_Set']);
    sequences = sequencesOption[selectedOption];
  }

  let matrix = baseSequences.get(client.gameId)["spin"][2]
  // let bonusOption = client.request.params.index == 0 ? 'buyBonusRandomMatrixIndex_0' : 'buyBonusRandomMatrixIndex_1'
  // const reelStopPostion = await getRandomItemByArrayWeights(client, settings[bonusOption].weights, settings[bonusOption].values)
  const reelStopPostion = await getRandomInt(client, sequences[0].length)

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

  matrixOption[0][0] = 'X'
  matrixOption[4][0] = 'X'
  const flattenedMatrix = matrixOption.flat();

  let count = 0;
  for (let i = 0; i < flattenedMatrix.length; i++) {
    if (flattenedMatrix[i] === 'S') {
      count++;
    }
  }

  if (client.request.params.index === 0) {
    return matrixOption;
  } else if (client.request.params.index === 1) {
    if ((count === 3 && selectedOption === 0) || (count === 4 && selectedOption === 1) || (count === 5 && selectedOption === 2)) {
      return matrixOption;
    } else {
      // Return the result of the recursive call
      return await getMatrix(client, settings);
    }
  }
}