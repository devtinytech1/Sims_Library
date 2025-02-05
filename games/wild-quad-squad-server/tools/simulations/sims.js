const baseSettings = require('../../src/game/runner/configs/settings.js')
const { TRIGGER } = require('../../../../src/game/runner/configs/static.cjs')
const matrix = require('../simulations/matrix_controller')
const { logRoundStats } = require('../simulations/Log Files/logRTPData.js')
const { check_to_replace_wild, check_to_replace_scatter, replace_Wild, replace_scatter } = require('../../src/game/runner/controllers/features/wild_scatter_replace_feature.js')
const { handleBaseGameCascade, createCascadeEndBG } = require('../../tools/simulations/cascade.js')
const mathUtils = require('../../../../src/utils/math.cjs')
const { scatterFeatureCheck } = require('../../tools/simulations/Features/scatters_feature.js')

async function execute(client) {
  initializeClient(client);
  for (let i = 0; i < 10000000; i++) {
    await playRound(client);
    if ((i + 1) % 1000 === 0) {
      logRoundStats(i + 1, client.node.spinBet, client.context.totalBaseGameWin, client.context.totalBGCascadeWin, client.context.totalFreeGameWin, client.context.totalFGCascadeWin);
    }
  }
}

function initializeClient(client) {
  client.nextState = TRIGGER.SPIN
  client.nextTrigger = TRIGGER.SPIN
  client.node.spinTotal = 0
  client.context.totalBaseGameWin = 0
  client.context.totalBGCascadeWin = 0
  client.context.totalFreeGameWin = 0
  client.context.totalFGCascadeWin = 0
}

async function playRound(client) {
  resetClientState(client)
  await processMatrix(client);
  if (client.nextTrigger === TRIGGER.CASCADE) {
    await handleCascade(client);
  } else if (client.nextTrigger === TRIGGER.SPIN) {
    await handleWildReveal(client);
  }

  if (client.nextTrigger === TRIGGER.CASCADE) {
    await handleCascade(client);
  }
  await handleCumulativeWin(client);
  client.context.cascade_end_matrix = client.cascade_end_matrix
  finalizeRound(client)
  await toCheckFeature(client)
}

async function toCheckFeature(client) {
  // to check for freespin
  const settings = baseSettings.get(client.gameId)
  if ((client.nextTrigger === TRIGGER.SPIN) && !client.context.isCascade) {
    await scatterFeatureCheck(client, client.matrix, settings.features.spin)
  }
  else if ((client.nextTrigger === TRIGGER.SPIN) && client.context.isCascade) {
    await scatterFeatureCheck(client, client.context.cascade_end_matrix, settings.features.spin)
  }
}

function resetClientState(client) {
  client.context.isCascade = false
  client.cascade = [];
  client.context.unMatchedWild = false;
  client.context.multiplierForSymbols = { H1: 1, H2: 1, H3: 1, H4: 1 };
  client.cascade_end_matrix = [];
  if (client.node.context.win !== undefined) {
    delete client.node.context.win;
  }
}

async function processMatrix(client) {
  client.matrix = await matrix.make(client, TRIGGER.SPIN, baseSettings.base.rows)

  if (await check_to_replace_scatter(client)) {
    client.matrix = await replace_scatter(client, client.matrix);
  }

  if (await check_to_replace_wild(client)) {
    client.matrix = await replace_Wild(client, client.matrix);
  }
  // to check for Cluster pay
  await matrix.check(client, client.matrix);
}


async function handleCascade(client) {
  client.context.isCascade = true
  const winMatrix = JSON.parse(JSON.stringify(client.matrix));
  const destroyArray = JSON.parse(JSON.stringify(client.node.context.destroy));
  const clientClone = createClientClone(client);
  await handleBaseGameCascade(clientClone, winMatrix, destroyArray, 'basegame_cascade');

  client.cascade_end_matrix = JSON.parse(JSON.stringify(clientClone.matrix));
  createCascadeEndBG(clientClone);

  client.nextTrigger = TRIGGER.SPIN;
  client.context.multiplierForSymbols = clientClone.context.multiplierForSymbols;
  client.node.spinTotal = clientClone.node.spinTotal;
  client.totalWin = clientClone.node.spinTotal;
  client.cascade = clientClone.cascade;
}

// to check for WildReveal(ScatterPay)
async function handleWildReveal(client) {
  const hasWild = client.matrix.some(row => row.includes('W'));
  if (hasWild) {
    client.context.unMatchedWild = true;
    client.matrix = await matrix.checkReavealedWild(client, client.matrix);
  }
}

async function handleCumulativeWin(client) {
  let cumulativeTotal = 0;
  if (client.node.context.win) {
    for (const line of client.node.context.win.lines) {
      cumulativeTotal += line.win;
      line.tillTotal = mathUtils.round(cumulativeTotal);
      client.context.totalBaseGameWin += line.win
      if (line.tillTotal > mathUtils.round(client.winCap * client.betMultiplier)) {
        line.tillTotal = mathUtils.round(client.winCap * client.betMultiplier);
      }
    }
  }

  if (client.cascade.length > 1) {
    for (const cascade of client.cascade) {
      if (cascade.winType === 'cluster' || cascade.winType === 'scatter') {
        for (const line of cascade.lines.map) {
          cumulativeTotal += line.win;
          line.tillTotal = mathUtils.round(cumulativeTotal);
          client.context.totalBGCascadeWin += line.win;
          if (line.tillTotal > mathUtils.round(client.winCap * client.betMultiplier)) {
            line.tillTotal = mathUtils.round(client.winCap * client.betMultiplier);
          }
        }
      }
    }
  }
}

function finalizeRound(client) {
  if (client.nextTrigger === TRIGGER.SPIN) {
    client.context.multiplierForSymbols = { H1: 1, H2: 1, H3: 1, H4: 1 };
  }
}

function createClientClone(client) {
  var clientClone = JSON.parse(JSON.stringify(client))
  clientClone.nextTrigger = TRIGGER.SPIN
  clientClone.addSpinTotal = value => {
    if (value) {
      var final_value = clientClone.node.spinTotal + value

      clientClone.node.spinTotal = Math.round(final_value * 1000000) / 1000000
      clientClone.totalWin = value
    }
    return value
  }
  clientClone.setGameRoundOver = () => clientClone.gameRoundOver = true

  delete clientClone.context.destroy
  delete clientClone.context.matrix
  delete clientClone.context.win
  delete clientClone.matrix
  clientClone.node.context = {}

  return clientClone
}
module.exports = { execute }