const baseSettings = require('../../configs/settings');
const { KEY, TRIGGER } = require('../../configs/static');
const features = require('../features/features');
const matrix = require('../matrix_controller');
const roundWin = require('../round_win_controller');
const { scatterFeatureCheck } = require('../features/scatters_feature');
 const { round } = require('../../../../utils/math')
 
async function execute(client) {
  if (client.prevTrigger !== TRIGGER.SPIN) {
    return Promise.reject(KEY.INVALID_ACTION);
  }
  client.roundBet = client.spinBet;
  client.nextState = TRIGGER.SPIN;
  client.nextTrigger = TRIGGER.SPIN;
  client.node.spinTotal = 0;

  features.init(client);
  features.prizePot.init(client)
  const settings = baseSettings.get(client.gameId);

  client.matrix = await matrix.make(client, settings.reelsSet.sequenceMap.basegame, baseSettings.base.rows);
  
  const beforeDiceMatrix = client.matrix.map(row => [...row]);
  // Check diceRoll triggered or not
  const diceRoll = await features.diceRoll.checkDiceRoll(client);
  if (diceRoll) {
    // Before Dice Feature winning
    roundWin.check(client);
    // Check diceOutcome(Bonus, Wild or Rsepin)
    await features.diceRoll.checkDiceRollFeature(client);
    client.context.features.diceRoll.afterDiceMatrix = client.matrix
    client.context.features.diceRoll.diceTriggered = true
    // Check Jackpot winning after Bonus or Wild Dice feature
    if (client.nextTrigger != TRIGGER.RESPIN) {
      features.prizePot.accumulation(client)
      features.prizePot.check(client)
    }
    //Give the Response to the client for Before & After Dice Feature winning
    const winData = client.node.context.features.diceRoll;
    if (winData.bonusPositions || winData.wildPositions) {
      winData.before = client.context.win
      roundWin.check(client);
      winData.after = client.context.win
    }
  } else {
    features.prizePot.accumulation(client)
    features.prizePot.check(client)
    roundWin.check(client);
  }
  // To check freespin triggered or not
  if (client.nextTrigger === TRIGGER.SPIN) {
    scatterFeatureCheck(client, client.matrix, settings.features.spin);
  }
  //maxwinCap
  if (client.node.context.win.total >= round(client.winCap * client.betMultiplier)) {
    client.node.context.win.total = round(client.winCap * client.betMultiplier)
  }
  if (client.node.context.features.total >= round(client.winCap * client.betMultiplier)) {
    client.node.context.features.total = round(client.winCap * client.betMultiplier)
  }
  client.matrix = beforeDiceMatrix
}

module.exports = { execute };
