
const baseSettings = require('../../src/game/runner/configs/settings')
const { TRIGGER } = require('../../../../src/game/runner/configs/static.cjs')
const { foundSymbols } = require('../../src/game/runner/math/found_symbols')
const features = require('../../../red-panda-rising-server/tools/simulations/Features/features.js')
const { transformReelToWildSymbols } = require('../../../red-panda-rising-server/tools/simulations/features/symbol_replace.js')
const { wildFeatureCheck } = require('../../../red-panda-rising-server/tools/simulations/features/wild_expansion_feature.js')
const { checkDefaultLines, getScatterWin } = require('../../src/game/runner/controllers/lines_controller')
const matrixController = require('../../src/game/runner/controllers/matrix_controller')
const roundWin = require('../../tools/simulations/round_win_controller.js')
const { logRoundStats } = require('../../tools/simulations/Log Files/logRTPData.js')
const { handleBGWinsData, logNoWinNoFeatureFrequency } = require('../../tools/simulations/Log Files/logBGData.js');
const { handleBGScatterWinsData, logNoWinScatterFeatureFrequency } = require('./Log Files/logBGScattersData.js')
const { handleBGNudgeWinsData, logNoWinNudgeFeatureFrequency } = require('./Log Files/logBGNudgeData.js')
const { handleBGNoNudgeWinsData, logNoWinNoNudgeFeatureFrequency } = require('../../tools/simulations/Log Files/logBGNoNudgeData.js')
const { scatterFeatureCheck } = require('../../../red-panda-rising-server/tools/simulations/features/scatters_feature.js')

let totalSpins = 0, totalScatterSpins = 0, totalNudgeSpins = 0, totalNoNudgeSpins = 0;
let totalBaseGameWin = 0, totalScatterWin = 0;
let totalFSWin = 0;

async function execute(client) {
  initializeClient(client);
  const settings = baseSettings.get(client.gameId)
  for (let i = 0; i < 1000000; i++) {
    totalSpins++;
    await playRound(client, settings);
    if ((i + 1) % 100 === 0) {
      logRoundStats(i + 1, client.node.spinBet, totalBaseGameWin, totalScatterWin, totalFSWin)
      logNoWinNoFeatureFrequency(i + 1, client.node.spinBet, totalSpins)
    }
  }
  logFeatureStats(client);
}

function initializeClient(client) {
  client.roundBet = client.spinBet;
  client.nextState = TRIGGER.SPIN;
  client.nextTrigger = TRIGGER.SPIN;
  client.node.spinTotal = 0;
}

async function playRound(client, settings) {

  client.matrix = await matrixController.make(client, TRIGGER.SPIN)
  features.init(client)
  client.getFeatures().isScatter = false

  client.getFeatures().expandingWildPosition = await getExpandingWildPosition(client, settings);
  processWildSymbols(client, client.getFeatures().expandingWildPosition);
  checkDefaultLines(client, client.matrix)
  await processScatterSymbols(client, settings);
  await processRoundWin(client, client.getFeatures().expandingWildPosition);

  await scatterFeatureCheck(client, client.matrix, settings.features.spin, TRIGGER.SPIN, TRIGGER.SPIN)  // check a triggering of free game bonus feature
  let isfsTriggered = client.getFeatures().isScatter
  if (isfsTriggered) {
    totalScatterSpins++
  }

  if (client.node.context.freespins && client.getFreespins().total) {
    let fswin = client.getFreespins().total
    totalFSWin += fswin
  }
}

async function getExpandingWildPosition(client, settings) {
  return await wildFeatureCheck(client, client.matrix, settings.features.spin);
}

function processWildSymbols(client, expandingWildPosition) {
  transformReelToWildSymbols(client, baseSettings, expandingWildPosition);
}

async function processScatterSymbols(client, settings) {
  const mask = foundSymbols(client.matrix, [settings.features.spin.scatters.symbol, settings.features.spin.wild.symbol])
  if (mask.length >= settings.features.spin.scatters.symbol_length) {
    // totalScatterSpins++;
    client.getWinModel().total = 0
    getScatterWin(client, mask)
    totalScatterWin += client.getWinModel().total
    // await handleBGScatterWinsData(client.getWinModel().total)
  }
}

async function processRoundWin(client, expandingWildPosition) {
  if (expandingWildPosition.length) {
    await handleNudgeWin(client);
  } else {
    await handleNoNudgeWin(client);
  }
  totalBaseGameWin += client.node.context.win.total;
  await handleBGWinsData(client.node.context.win.total);
}

async function handleNudgeWin(client) {
  await roundWin.check(client);
  if (client.node.context.win.total > 0) {
    totalNudgeSpins++;
    await handleBGNudgeWinsData(client.node.context.win.total);
  }
}

async function handleNoNudgeWin(client) {
  await roundWin.check(client);
  if (client.node.context.win.total > 0) {
    totalNoNudgeSpins++;
    await handleBGNoNudgeWinsData(client.node.context.win.total);
  }
}

function logFeatureStats(client) {
  logNoWinScatterFeatureFrequency(totalScatterSpins, client.node.spinBet, totalSpins);
  logNoWinNudgeFeatureFrequency(totalNudgeSpins, client.node.spinBet, totalSpins);
  logNoWinNoNudgeFeatureFrequency(totalNoNudgeSpins, client.node.spinBet, totalSpins);
}

module.exports = { execute }