const mathUtils = require('../../../../../src/utils/math.cjs');
const baseSettings = require('../../../src/game/runner/configs/settings');
const random = require('../../../src/game/runner/math/random_controller');
const matrixController = require('../../../src/game/runner/controllers/matrix_controller');
// create model for easch spin
function getWheelModel(value, values, total, spinCount, respin, level, stopIndex) {
  return {
    value: value,
    values: values,
    total: total,
    spinCount: spinCount,
    respin: respin,
    level: level,
    stopIndex: stopIndex
  };
}
//create model for the whole feature, each spin result will be pushed into wheel array
function initWheelBonusMainModel(client) {
  const model = client.getFeatures().wheel = {
    mask: [],
    triggeringMatrix: [],
    wheel: [],
  };
  client.getWheel = () => model;
  return model;
}

async function check(client, matrix) {
  const wheelSettings = baseSettings.get(client.gameId).features.wheel
  var mask = matrixController.foundSymbols(matrix, wheelSettings.triggerSymbol);
  var totalSpinCount = mask.length;

  var topWheelWins = new Array(8).fill(0);
  var middleWheelWins = new Array(8).fill(0);

  initWheelBonusMainModel(client);

  if (totalSpinCount) {
    await calculateWheelWins(client, totalSpinCount, topWheelWins, middleWheelWins);
    client.node.context.features.wheel.mask.push(...mask)
    client.node.context.features.wheel.triggeringMatrix.push(...matrix)
  }
}

async function calculateWheelWins(client, totalSpinCount, topWheelWins, middleWheelWins) {
  var allValues = []
  var awardedValue = []
  var level = 0
  var multiplierAwarded = 0
  var isRespin = false


  const wheelSettings = baseSettings.get(client.gameId).features.wheel

  var topWheelWinValue = await random.getRandomItemByArrayWeights(client, wheelSettings.top_wheel_weights, wheelSettings.top_wheel_values);
  var middleWheelWinValue = await random.getRandomItemByArrayWeights(client, wheelSettings.middle_wheel_weights, wheelSettings.middle_wheel_values);
  var bottomWheelWinValue = await random.getRandomItemByArrayWeights(client, wheelSettings.bottom_wheel_weights, wheelSettings.bottom_wheel_values);

  var indexForTopWheel = wheelSettings.top_wheel_values.findIndex(element => element[0] === topWheelWinValue[0] && element[1] === topWheelWinValue[1]);
  var indexForMiddleWheel = wheelSettings.middle_wheel_values.findIndex(element => element[0] === middleWheelWinValue[0] && element[1] === middleWheelWinValue[1]);
  var indexForBottomWheel = wheelSettings.bottom_wheel_values.findIndex(element => element[0] === bottomWheelWinValue[0] && element[1] === bottomWheelWinValue[1]);

  var stopIndex = [indexForTopWheel, indexForMiddleWheel, indexForBottomWheel]

  if (topWheelWins[indexForTopWheel] === 1 && middleWheelWins[indexForMiddleWheel] === 1) {
    allValues = wheelSettings.bottom_wheel_values
    multiplierAwarded = bottomWheelWinValue[0]
    isRespin = bottomWheelWinValue[1]
    awardedValue = bottomWheelWinValue
    level = 3
  } else if (topWheelWins[indexForTopWheel] === 1) {
    allValues = wheelSettings.middle_wheel_values;
    multiplierAwarded = middleWheelWinValue[0]
    isRespin = middleWheelWinValue[1]
    awardedValue = middleWheelWinValue
    middleWheelWins[indexForMiddleWheel] = 1
    level = 2;
  } else if (topWheelWins[indexForTopWheel] === 0) {
    allValues = wheelSettings.top_wheel_values;
    multiplierAwarded = topWheelWinValue[0]
    isRespin = topWheelWinValue[1]
    awardedValue = topWheelWinValue
    topWheelWins[indexForTopWheel] = 1
    level = 1;
  }

  const winTotal = mathUtils.round(multiplierAwarded * client.lastResponse.spinBet);
  client.getFeatures().total = mathUtils.round(client.getFeatures().total + winTotal);

  const model = getWheelModel(awardedValue, allValues, winTotal, totalSpinCount, isRespin, level, stopIndex);
  client.node.context.features.wheel.wheel.push(model);
  totalSpinCount--

  if (isRespin) {
    totalSpinCount++
  }

  if (totalSpinCount > 0) {
    await calculateWheelWins(client, totalSpinCount, topWheelWins, middleWheelWins);
  }
}

module.exports = { check };
