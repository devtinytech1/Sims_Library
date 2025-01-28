
const baseSettings = require('../../configs/settings')
const { KEY, TRIGGER } = require('../../configs/static')
const features = require('../features/features')
const matrix = require('../matrix_controller')
const roundWin = require('../round_win_controller')
const { scatterFeatureCheck } = require('../features/scatters_feature')
const { round } = require('../../../../utils/math')

// Replace symbols for the base game respin.
function replaceSymbolsBG(client, diceRollFeature) {
  const randomSymbol = diceRollFeature.randomSymbol;

  const randomLocked = diceRollFeature.respinPositions;
  randomLocked.forEach(([col, row]) => {
    client.matrix[col][row] = randomSymbol;
  });

  const scattersReplace = diceRollFeature.scatterPositions;
  scattersReplace.forEach(([col, row]) => {
    client.matrix[col][row] = baseSettings.base.scatters;
  });

  const jackpotReplace = diceRollFeature.jackpotPositions;
  jackpotReplace.forEach(([col, row]) => {
    client.matrix[col][row] = baseSettings.base.Jackpot;
  });

  const special = matrix.foundSymbols(client.matrix, baseSettings.base.Special);
  special.forEach(([col, row]) => {
    client.matrix[col][row] = randomSymbol;
  });
}

// Replace symbols for the free spins respin.
function replaceSymbolsFS(client, diceRollFeature) {
  const randomSymbol = diceRollFeature.randomSymbol;
  const randomLocked = diceRollFeature.respinPositions;
  randomLocked.forEach(([col, row]) => {
    client.matrix[col][row] = randomSymbol;
  });
}

async function execute(client) {
  if (client.prevTrigger !== TRIGGER.RESPIN) {
    return Promise.reject(KEY.INVALID_ACTION)
  }
  client.nextState = client.lastResponse.state
  client.nextTrigger = client.lastResponse.state
  features.init(client)
  features.prizePot.init(client)
  client.node.context.isRespin = true

  const settings = baseSettings.get(client.gameId)

  if (client.prevState === TRIGGER.SPIN) {
    client.matrix = await matrix.make(client, settings.reelsSet.sequenceMap.basegame_respin, baseSettings.base.rows)
    // Replace symbols
    replaceSymbolsBG(client, client.lastResponse.context.features.diceRoll);
    // To Check Jackpot winning
    features.prizePot.accumulation(client)
    features.prizePot.check(client)
  } else if (client.prevState === TRIGGER.FREESPINS) {
    client.matrix = await matrix.make(client, settings.reelsSet.sequenceMap.freespins_respin, baseSettings.base.fsrows)
    // Replace symbols
    replaceSymbolsFS(client, client.lastResponse.context.features.fs_diceRoll);
    // Update the client's freespin context.
    client.node.context.freespins = client.lastResponse.context.freespins
    if (client.node.context.freespins.left < 1) {
      //MaxwinCap
      if (client.node.context.freespins.total >= round(client.winCap * client.betMultiplier)) {
        client.node.context.freespins.total = round(client.winCap * client.betMultiplier)
      }
      client.nextTrigger = TRIGGER.FREESPINS_END
    }
  }

  // After Dice Feature winning
  roundWin.check(client)

  if (client.nextTrigger === TRIGGER.SPIN) {
    scatterFeatureCheck(client, client.matrix, settings.features.spin)
  }

  //maxwinCap
  if (client.node.context.win.total >= round(client.winCap * client.betMultiplier)) {
    client.node.context.win.total = round(client.winCap * client.betMultiplier)
  }
  if (client.node.context.features.total >= round(client.winCap * client.betMultiplier)) {
    client.node.context.features.total = round(client.winCap * client.betMultiplier)
  }
}

module.exports = { execute }