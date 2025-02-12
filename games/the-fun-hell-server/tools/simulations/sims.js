const baseSettings = require('../../src/game/runner/configs/settings');
const { TRIGGER } = require('../../../../src/game/runner/configs/static.cjs');
const matrix = require('../../src/game/runner/controllers/matrix_controller');
const roundWin = require('../../tools/simulations/round_win_controller');
const { round } = require('../../../../src/utils/math.cjs');
const features = require('../../tools/simulations/features/features');
const { scatterFeatureCheck } = require('../../tools/simulations/features/scatters_feature');
const { logRoundStats, logFeatureRTP } = require('../../../the-fun-hell-server/tools/simulations/LogFiles/logRTPData');
const { handleBGWinsData, logNoWinNoFeatureFrequency } = require('./LogFiles/logBGData');

let totalBasegameWin = 0;

let totalFSgameWin = 0;

let totalSpins = 0;

async function execute(client) {
  initializeClient(client);
  const settings = baseSettings.get(client.gameId);
  let bgTotalWin = 0, fgTotalWin = 0

  for (let i = 0; i < 10000000000; i++) {
    totalSpins++;
    await playRound(client, settings);
    bgTotalWin = calculateBgTotalWin();
    fgTotalWin = calculateFgTotalWin();

    // Log round information and RTP for every 100 rounds
    if ((i + 1) % 1000 === 0) {
      logRoundData(i + 1, client, bgTotalWin, fgTotalWin);
    }
  }
}


function logRoundData(i, client, bgTotalWin, fgTotalWin, jpTotalWin) {
  const logParams = {
    round: i + 1,
    client: client,
    totalBasegameWin: totalBasegameWin,
    totalFSgameWin: totalFSgameWin
  };
  logRoundStats(i + 1, client.node.spinBet, bgTotalWin, fgTotalWin);
  logFeatureRTP(i + 1, client, logParams);
  logNoWinNoFeatureFrequency(i + 1, client.node.spinBet, totalSpins)
}

function initializeClient(client) {
  client.roundBet = client.spinBet;
  client.nextState = TRIGGER.SPIN;
  client.nextTrigger = TRIGGER.SPIN;
  client.node.spinTotal = 0;
  features.init(client);
}

function calculateBgTotalWin() {
  return totalBasegameWin
}

function calculateFgTotalWin() {
  return totalFSgameWin
}

async function playRound(client, settings) {
  client.matrix = await matrix.make(client, settings.reelsSet.sequenceMap.MainBoard, baseSettings.base.rows);

  let basegameWin = 0;
  await handleBGWins(client);
  basegameWin = client.node.context.basegameWin
  //Calulate Hit Frequency with RTP
  await handleBGWinsData(basegameWin)
  await scatterFeatureCheck(client, settings.features.spin);
  //Calculate basegame wins with dice features
  updateBGTotals(basegameWin);
  //Freespins calculation
  handleFSWinCalculation(client);
  maxWinCap(client);
  //Jackpot Data Reinitialized
  resetClientState(client);
}

async function handleBGWins(client) {
  await roundWin.check(client);
}

function updateBGTotals(basegameWin) {
  totalBasegameWin += basegameWin;
}

function handleFSWinCalculation(client) {
  // Check if frees spins context exists
  if (client.node.context.features && client.node.context.features.wheel) {
    handleFSWin(client.node.context.features.wheel.wheel, client);
  }
}

function handleFSWin(wheel, client) {
  for (let i = 0; i < wheel.length; i++) {
    totalFSgameWin += wheel[i].value[0] * client.spinBet
  }
}

function maxWinCap(client) {
  const winCapLimit = round(client.winCap * client.betMultiplier);
  if (client.node.context.win.total >= winCapLimit) {
    client.node.context.win.total = winCapLimit;
  }
  if (client.node.context.features.total >= winCapLimit) {
    client.node.context.features.total = winCapLimit;
  }
}

function resetClientState(client) {
  features.init(client);
}

module.exports = { execute };