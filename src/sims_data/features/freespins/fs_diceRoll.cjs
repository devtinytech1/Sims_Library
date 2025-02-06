const baseSettings = require('../../../../games/die-pinata-die-server/src/game/runner/configs/settings');
const { getRandomItemByArrayWeights } = require('../../../../src/game/runner/math/main_random_controller.cjs');
const matrix = require('../../../../games/die-pinata-die-server/src/game/runner/controllers/matrix_controller');

const DICE_ROLL_PROB = 'fs_diceRollProb';
const DICE_ROLL_OUTCOME = 'fs_diceRollOutcome';
const FEATURE_PROB = 'fs_featureProb';
const FEATURE_OUTCOME = 'fs_featureOutcome';
const CONVERT_TO_BONUS_PROB = 'fs_convertToBonusProb';
const CONVERT_TO_BONUS_OUTCOME = 'fs_convertToBonusOutcome';
const CONVERT_TO_WILD_PROB = 'fs_convertToWildProb';
const CONVERT_TO_WILD_OUTCOME = 'fs_convertToWildOutcome';
const RESPIN_PROB = 'fs_RespinProb';
const RESPIN_OUTCOME = 'fs_RespinOutcome';

// Checks diceRoll triggered or not
async function checkDiceRoll(client) {
  const settings = baseSettings.get(client.gameId);
  const isDiceRoll = await getRandomItemByArrayWeights(client, settings.features.fs_diceRoll[DICE_ROLL_PROB], settings.features.fs_diceRoll[DICE_ROLL_OUTCOME]);
  return isDiceRoll
}

//Check the diceOutcome (Bonus, Wild or Respin)
async function checkDiceRollFeature(client) {
  const settings = baseSettings.get(client.gameId);
  const wild = baseSettings.base.wilds;
  const scatter = baseSettings.base.scatters;

  const diceOutcome = await getRandomItemByArrayWeights(client, settings.features.fs_diceRoll[FEATURE_PROB], settings.features.fs_diceRoll[FEATURE_OUTCOME]);
  if (diceOutcome === 'fs_Bonus') {
    const symbolConvertToBonus = await getRandomItemByArrayWeights(client, settings.features.fs_diceRoll.fs_Bonus[CONVERT_TO_BONUS_PROB], settings.features.fs_diceRoll.fs_Bonus[CONVERT_TO_BONUS_OUTCOME]);
    client.node.context.features.fs_diceRoll = await convertToBonusOutcome(client, symbolConvertToBonus, scatter);
  } else if (diceOutcome === 'fs_Wild') {
    const symbolConvertToWild = await getRandomItemByArrayWeights(client, settings.features.fs_diceRoll.fs_Wild[CONVERT_TO_WILD_PROB], settings.features.fs_diceRoll.fs_Wild[CONVERT_TO_WILD_OUTCOME]);
    client.node.context.features.fs_diceRoll = await convertToWildOutcome(client, symbolConvertToWild, wild);
  } else if (diceOutcome === 'fs_ReSpin') {
    const symbol = await getRandomItemByArrayWeights(client, settings.features.fs_diceRoll.fs_ReSpin[RESPIN_PROB], settings.features.fs_diceRoll.fs_ReSpin[RESPIN_OUTCOME]);
    client.node.context.features.fs_diceRoll = await reSpinOutcome(client, symbol);
  }
}

// Updates the matrix with converted symbols to bonus.
async function convertToBonusOutcome(client, symbolConvertToBonus, scatter) {
  const bonusPositions = matrix.foundSymbols(client.matrix, symbolConvertToBonus);
  bonusPositions.forEach(([col, row]) => {
    client.matrix[col][row] = scatter;
  });

  return {
    randomSymbol: symbolConvertToBonus,
    bonusPositions: bonusPositions,
    featureTriggered: scatter,
  };
}

// Updates the matrix with converted symbols to wild.
async function convertToWildOutcome(client, symbolConvertToWild, wild) {
  const wildPositions = matrix.foundSymbols(client.matrix, symbolConvertToWild);
  wildPositions.forEach(([col, row]) => {
    client.matrix[col][row] = wild;
  });

  return {
    randomSymbol: symbolConvertToWild,
    wildPositions: wildPositions,
    featureTriggered: wild,
  };
}

//To check respin triggered or not
async function reSpinOutcome(client, symbol) {
  const respinPositions = matrix.foundSymbols(client.matrix, symbol);

  return {
    randomSymbol: symbol,
    respinPositions: respinPositions,
    stickyPositions: respinPositions,
    featureTriggered: 'fs_ReSpin',
  };
}

module.exports = { checkDiceRoll, checkDiceRollFeature };
