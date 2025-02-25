const baseSettings = require('../../../../games/die-pinata-die-server/src/game/runner/configs/settings');
const { getRandomItemByArrayWeights } = require('../../../../src/game/runner/math/main_random_controller.cjs');
const matrix = require('../../../../src/game/runner/math/foundSymbols.cjs');

const DICE_ROLL_PROB = 'diceRollProb';
const DICE_ROLL_OUTCOME = 'diceRollOutcome';
const FEATURE_PROB = 'featureProb';
const FEATURE_OUTCOME = 'featureOutcome';
const CONVERT_TO_BONUS_PROB = 'convertToBonusProb';
const CONVERT_TO_BONUS_OUTCOME = 'convertToBonusOutcome';
const CONVERT_TO_WILD_PROB = 'convertToWildProb';
const CONVERT_TO_WILD_OUTCOME = 'convertToWildOutcome';
const RESPIN_PROB = 'respinProb';
const RESPIN_OUTCOME = 'respinOutcome';

// Checks diceRoll triggered or not
async function checkDiceRoll(client) {
  const settings = baseSettings.get(client.gameId);
  const isDiceRoll = await getRandomItemByArrayWeights(client, settings.features.diceRoll[DICE_ROLL_PROB], settings.features.diceRoll[DICE_ROLL_OUTCOME]);
  return isDiceRoll
}

//Check the diceOutcome (Bonus, Wild or Respin)
async function checkDiceRollFeature(client) {
  const settings = baseSettings.get(client.gameId);
  const wild = baseSettings.base.wilds;
  const scatter = baseSettings.base.scatters;

  const diceOutcome = await getRandomItemByArrayWeights(client, settings.features.diceRoll[FEATURE_PROB], settings.features.diceRoll[FEATURE_OUTCOME]);
  if (diceOutcome === 'Bonus') {
    const symbolConvertToBonus = await getRandomItemByArrayWeights(client, settings.features.diceRoll.Bonus[CONVERT_TO_BONUS_PROB], settings.features.diceRoll.Bonus[CONVERT_TO_BONUS_OUTCOME]);
    client.node.context.features.diceRoll = await convertToBonusOutcome(client, symbolConvertToBonus, scatter);
  } else if (diceOutcome === 'Wild') {
    const symbolConvertToWild = await getRandomItemByArrayWeights(client, settings.features.diceRoll.Wild[CONVERT_TO_WILD_PROB], settings.features.diceRoll.Wild[CONVERT_TO_WILD_OUTCOME]);
    client.node.context.features.diceRoll = await convertToWildOutcome(client, symbolConvertToWild, wild);
  } else if (diceOutcome === 'ReSpin') {
    const randomSymbol = await getRandomItemByArrayWeights(client, settings.features.diceRoll.ReSpin[RESPIN_PROB], settings.features.diceRoll.ReSpin[RESPIN_OUTCOME]);
    client.node.context.features.diceRoll = await reSpinOutcome(client, randomSymbol, baseSettings);
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

//Check respin triggered
async function reSpinOutcome(client, randomSymbol, baseSettings) {
  const respinPositions = matrix.foundSymbols(client.matrix, randomSymbol);
  const scatterPositions = matrix.foundSymbols(client.matrix, baseSettings.base.scatters);
  const jackpotPositions = matrix.foundSymbols(client.matrix, baseSettings.base.Jackpot);

  const allPositions = [...respinPositions, ...scatterPositions, ...jackpotPositions];

  return {
    randomSymbol: randomSymbol,
    respinPositions: respinPositions,
    scatterPositions: scatterPositions,
    jackpotPositions: jackpotPositions,
    stickyPositions: allPositions,
    featureTriggered: 'Respin',
  };
}

module.exports = { checkDiceRoll, checkDiceRollFeature };
