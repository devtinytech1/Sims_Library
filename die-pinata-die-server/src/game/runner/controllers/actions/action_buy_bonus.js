const mathUtils = require('../../../../utils/math')
const baseSequences = require('../../configs/sequences')
const baseSettings = require('../../configs/settings')
const { KEY, TRIGGER } = require('../../configs/static')
const features = require('../features/features'); 
const roundWin = require('../round_win_controller')
const { getRandomItemByArrayWeights, getRandomInt } = require('../../math/random_controller');
const { scatterFeatureCheck } = require('../features/scatters_feature');
const matrix = require('../matrix_controller')

const CONVERT_TO_BONUS_PROB = 'convertToBonusProb';
const CONVERT_TO_BONUS_OUTCOME = 'convertToBonusOutcome';
const CONVERT_TO_WILD_PROB = 'convertToWildProb';
const CONVERT_TO_WILD_OUTCOME = 'convertToWildOutcome';

async function execute(client) {
  const settings = baseSettings.get(client.gameId)
  const wilds = baseSettings.base.wilds;
  const scatter = baseSettings.base.scatters;
  
  // Check if the previous trigger was not SPIN
  if (client.prevTrigger !== TRIGGER.SPIN) {
    return Promise.reject(KEY.INVALID_ACTION)
  }
  
  client.nextState = TRIGGER.SPIN
  client.nextTrigger = TRIGGER.SPIN
  client.node.spinTotal = 0
  
  features.init(client);
  features.prizePot.init(client)
  // Calculate round bet based on spin bet and settings
  client.roundBet = mathUtils.round(client.spinBet * settings.buyBonusMultiplier[client.request.params.index])
  
  // Generate the matrix based on the specific conditions
  if(client.request.params.index === 0 || client.request.params.index === 1)
  {
    client.matrix = await getMatrix(client);
  }
  else if (client.request.params.index === 2)
  {
    client.matrix = await matrix.make(client, settings.reelsSet.sequenceMap.basegame, baseSettings.base.rows);
  }

  const beforeDiceMatrix = client.matrix.map(row => [...row]);

  roundWin.check(client);

  if (client.request.params.index === 1) {
    const symbolConvertToBonus = await getRandomItemByArrayWeights(client, settings.features.diceRoll.Bonus[CONVERT_TO_BONUS_PROB], settings.features.diceRoll.Bonus[CONVERT_TO_BONUS_OUTCOME]);
    client.node.context.features.diceRoll = await convertToBonus(client, symbolConvertToBonus, scatter);
  } else if(client.request.params.index === 2){
    const symbolConvertToWild = await getRandomItemByArrayWeights(client, settings.features.diceRoll.Wild[CONVERT_TO_WILD_PROB], settings.features.diceRoll.Wild[CONVERT_TO_WILD_OUTCOME]);
    client.node.context.features.diceRoll =  await convertToWild(client, symbolConvertToWild, wilds)
  }

  if (client.request.params.index === 1 || client.request.params.index === 2)
  {
    client.context.features.diceRoll.afterDiceMatrix = client.matrix
    client.context.features.diceRoll.diceTriggered = true
    const winData = client.node.context.features.diceRoll;
    features.prizePot.accumulation(client)
    features.prizePot.check(client)
    if (winData.bonusPositions || winData.wildPositions) {
      winData.before = client.context.win
      roundWin.check(client);
      winData.after = client.context.win
    }
  }
  scatterFeatureCheck(client, client.matrix, settings.features.spin);
  client.matrix = beforeDiceMatrix
}

// Generate matrix using stopped position and settings
async function getMatrix(client) {
  let matrixOption = [];
  let sequences = baseSequences.get(client.gameId)["BuyOption"];
  let matrix = baseSequences.get(client.gameId)["basegame"][0];
 
  const reelStopPosition = await getRandomInt(client, sequences[0].length)

  for (let reel = 0; reel < matrix.length; reel++) {
    let reelSymbols = [];
    for (let row = 0; row < baseSettings.base.rows; row++) {
      let symbolPos = sequences[reel][reelStopPosition];
      let rowPos = symbolPos + row;
      if (symbolPos + row >= matrix[reel].length) {
        rowPos = rowPos - matrix[reel].length;
      }
      reelSymbols.push(matrix[reel][rowPos]);
    }
    matrixOption.push(reelSymbols);
  }
  return matrixOption;
}
// Define functions for converting to Bonus and Wild
async function convertToBonus(client, symbolConvertToBonus, scatter) {
  const bonusPositions = matrix.foundSymbols(client.matrix, symbolConvertToBonus);
  bonusPositions.forEach(([col, row]) =>{
    client.matrix[col][row] = scatter;
  });
  return {
    randomSymbol: symbolConvertToBonus,
    bonusPositions: bonusPositions,
    featureTriggered: scatter,
  };
}
async function convertToWild(client, symbolConvertToWild, wild) {
  const wildPositions = matrix.foundSymbols(client.matrix, symbolConvertToWild);
  wildPositions.forEach(([col, row]) =>{
    client.matrix[col][row] = wild;
  });
  return {
    randomSymbol: symbolConvertToWild,
    wildPositions: wildPositions,
    featureTriggered: wild,
  };
}

module.exports = { execute };
