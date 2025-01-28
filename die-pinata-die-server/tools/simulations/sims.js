const baseSettings = require('../../src/game/runner/configs/settings');
const { TRIGGER } = require('../../src/game/runner/configs/static');
const matrix = require('../../src/game/runner/controllers/matrix_controller');
const roundWin = require('../../tools/simulations/round_win_controller');
const { round } = require('../../src/utils/math');
const features = require('../../tools/simulations/features/features');
const respinData = require('../../tools/simulations/respin');
const { scatterFeatureCheck } = require('../../tools/simulations/features/scatters_feature');
const { logRoundStats, logFeatureRTP } = require('./LogFiles/logRTPData');
const { handleBGWinsData, logNoWinNoFeatureFrequency } = require('./LogFiles/logBGData');
const { handleJPMiniWinsData, logMiniFeatureFrequency } = require('./LogFiles/logJPMiniData');
const { handleJPMinorWinsData, logMinorFeatureFrequency } = require('./LogFiles/logJPMinorData');
const { handleJPMajorWinsData, logMajorFeatureFrequency } = require('./LogFiles/logJPMajorData');
const { handleJPGrandWinsData, logGrandFeatureFrequency } = require('./LogFiles/logJPGrandData');
const { handleFGWinsData, logNoWinFSFeatureFrequency } = require('./LogFiles/logFGData');
const { handleBGWildWinsData, logNoWinBGWildFeatureFrequency } = require('./LogFiles/logBGWildData');
const { handleBGBonusWinsData, logNoWinBGBonusFeatureFrequency } = require('./LogFiles/logBGBonusData');
const { handleBGRespinWinsData, logNoWinBGRespinFeatureFrequency } = require('./LogFiles/logBGRespinData');
const { handleFGRespinWinsData, logNoWinFGRespinFeatureFrequency } = require('./LogFiles/logFGRespinData');
const { handleFGWildWinsData, logNoWinFGWildFeatureFrequency } = require('./LogFiles/logFGWildData');
const { handleFGBonusWinsData, logNoWinFGBonusFeatureFrequency } = require('./LogFiles/logFGBonusData');

let totalDiceWild = 0, totalDiceBonus = 0, totalRespinWin = 0, totalBasegameWin = 0;

let totalFsDiceWild = 0, totalFsDiceBonus = 0, totalFsRespinWin = 0, totalFSgameWin = 0;

let Mini = 0, Minor = 0, Major = 0, Grand = 0;
let totalMiniSpinsTriggered = 0, totalMinorSpinsTriggered = 0, totalMajorSpinsTriggered = 0, totalGrandSpinsTriggered = 0;

let isFsDiceTriggered = false;
let totalSpins = 0;

let freeSpinTriggerCount = 0;
let bgWildSpinTriggerCount = 0;
let bgBonusSpinTriggerCount = 0;
let bgRespinSpinTriggerCount = 0;

let fgRespinSpinTriggerCount = 0;
let fgWildSpinTriggerCount = 0;
let fgBonusSpinTriggerCount = 0;

async function execute(client) {
  initializeClient(client);
  const settings = baseSettings.get(client.gameId);
  let bgTotalWin = 0, fgTotalWin = 0, jpTotalWin = 0;

  for (let i = 0; i < 5000000; i++) {
    totalSpins++;
    incrementTriggers();
    await playRound(client, settings);
    bgTotalWin = calculateBgTotalWin();
    fgTotalWin = calculateFgTotalWin();
    jpTotalWin = calculateJpTotalWin();
    // Log round information and RTP for every 100 rounds
    if ((i + 1) % 100 === 0) {
      logRoundData(i + 1, client, bgTotalWin, fgTotalWin, jpTotalWin);
    }
  }
  console.log('FREESPINS TRIGGERED COUNT', freeSpinTriggerCount);
  logNoWinBGWildFeatureFrequency(bgWildSpinTriggerCount, client.node.spinBet, totalSpins)
  logNoWinBGBonusFeatureFrequency(bgBonusSpinTriggerCount, client.node.spinBet, totalSpins)
  logNoWinBGRespinFeatureFrequency(bgRespinSpinTriggerCount, client.node.spinBet, totalSpins)
  logNoWinFSFeatureFrequency(freeSpinTriggerCount, client.node.spinBet, totalSpins)
  logNoWinFGRespinFeatureFrequency(fgRespinSpinTriggerCount, client.node.spinBet, totalSpins)
  logNoWinFGWildFeatureFrequency(fgWildSpinTriggerCount, client.node.spinBet, totalSpins)
  logNoWinFGBonusFeatureFrequency(fgBonusSpinTriggerCount, client.node.spinBet, totalSpins)
}

function incrementTriggers() {
  totalMiniSpinsTriggered++;
  totalMinorSpinsTriggered++;
  totalMajorSpinsTriggered++;
  totalGrandSpinsTriggered++;
}

function logRoundData(i, client, bgTotalWin, fgTotalWin, jpTotalWin) {
  const logParams = {
    round: i + 1,
    client: client,
    Mini: Mini,
    Minor: Minor,
    Major: Major,
    Grand: Grand,
    totalDiceWild: totalDiceWild,
    totalDiceBonus: totalDiceBonus,
    totalRespinWin: totalRespinWin,
    totalBasegameWin: totalBasegameWin,
    totalFsDiceWild: totalFsDiceWild,
    totalFsDiceBonus: totalFsDiceBonus,
    totalFsRespinWin: totalFsRespinWin,
    totalFSgameWin: totalFSgameWin
  };
  logRoundStats(i + 1, client.node.spinBet, bgTotalWin, fgTotalWin, jpTotalWin);
  // logFeatureRTP(i + 1, client, logParams);
  logNoWinNoFeatureFrequency(i + 1, client.node.spinBet, totalSpins)
  logMiniFeatureFrequency(i + 1, client.node.spinBet, totalSpins, totalMiniSpinsTriggered)
  logMinorFeatureFrequency(i + 1, client.node.spinBet, totalSpins, totalMinorSpinsTriggered)
  logMajorFeatureFrequency(i + 1, client.node.spinBet, totalSpins, totalMajorSpinsTriggered)
  logGrandFeatureFrequency(i + 1, client.node.spinBet, totalSpins, totalGrandSpinsTriggered)
}

function initializeClient(client) {
  client.roundBet = client.spinBet;
  client.nextState = TRIGGER.SPIN;
  client.nextTrigger = TRIGGER.SPIN;
  client.node.spinTotal = 0;
  features.init(client);
  features.prizePot.init(client);
}

function calculateBgTotalWin() {
  return totalBasegameWin + totalDiceWild + totalDiceBonus + totalRespinWin;
}

function calculateFgTotalWin() {
  return totalFSgameWin + totalFsDiceWild + totalFsDiceBonus + totalFsRespinWin;
}

function calculateJpTotalWin() {
  return Mini + Minor + Major + Grand;
}

async function playRound(client, settings) {
  client.matrix = await matrix.make(client, settings.reelsSet.sequenceMap.basegame, baseSettings.base.rows);

  let dice_Bonus = 0, dice_Wild = 0, roundRespinWin = 0, basegameWin = 0;
  await handleBGWins(client);
  basegameWin = client.node.context.basegameWin
  //Calulate Hit Frequency with RTP
  await handleBGWinsData(basegameWin)
  //Calculate Jackpot levels Hit Frequency with RTP
  await prizePotCalulation(client);
  // Check if the dice roll feature is triggered
  const diceRollTriggered = await features.diceRoll.checkDiceRoll(client);
  if (diceRollTriggered) {
    await handleDiceRollFeature(client);
    [dice_Wild, dice_Bonus] = await getDiceWinData(client);
    roundRespinWin = getDiceRespinWin(client);
    if (roundRespinWin > 0) {
      bgRespinSpinTriggerCount++
      await handleBGRespinWinsData(roundRespinWin)
    }
  }
  let isFSTriggered = await scatterFeatureCheck(client, client.matrix, settings.features.spin, isFsDiceTriggered);
  if (isFSTriggered) {
    freeSpinTriggerCount++
  }
  //Calculate basegame wins with dice features
  updateBGTotals(dice_Wild, dice_Bonus, roundRespinWin, basegameWin);
  //Freespins calculation
  handleFSWinCalculation(client);
  maxWinCap(client);
  //Jackpot Data Reinitialized
  resetClientState(client);
}

async function prizePotCalulation(client) {
  if (client.node.context.features.prizePot.level === 0 && client.node.context.features.prizePot.win > 0) {
    await handleJPMiniWinsData(client.node.context.features.prizePot.win)
  }
  if (client.node.context.features.prizePot.level === 1 && client.node.context.features.prizePot.win > 0) {
    await handleJPMinorWinsData(client.node.context.features.prizePot.win)
  }
  if (client.node.context.features.prizePot.level === 2 && client.node.context.features.prizePot.win > 0) {
    await handleJPMajorWinsData(client.node.context.features.prizePot.win)
  }
  if (client.node.context.features.prizePot.level === 3 && client.node.context.features.prizePot.win > 0) {
    await handleJPGrandWinsData(client.node.context.features.prizePot.win)
  }
}

async function handleBGWins(client) {
  features.prizePot.accumulation(client);
  features.prizePot.check(client);
  await handlePrizePotLevel(client);
  await roundWin.check(client);
}

async function handlePrizePotLevel(client) {
  const level = client.node.context.features.prizePot.level;
  const winAmount = client.node.context.features.prizePot.win;
  if (winAmount > 0) {
    switch (level) {
      case 0:
        Mini += winAmount;
        break;
      case 1:
        Minor += winAmount;
        break;
      case 2:
        Major += winAmount;
        break;
      case 3:
        Grand += winAmount;
        break;
      default:
        break;
    }
  }
}

async function handleDiceRollFeature(client) {
  // Check the dice roll feature (Bonus, Wild, or Respin)
  await features.diceRoll.checkDiceRollFeature(client);
  const winData = client.node.context.features.diceRoll;
  if (winData.bonusPositions || winData.wildPositions) {
    winData.before = client.context.win;
    await roundWin.check(client);
    winData.after = client.context.win;
  } else if (winData.respinPositions) {
    await respinData.execute(client, isFsDiceTriggered);
  }
}

async function getDiceWinData(client) {
  const winData = client.node.context.features.diceRoll;
  let dice_Wild = 0, dice_Bonus = 0;
  if (winData.wildPositions) {
    dice_Wild = winData.after.total;
    if (dice_Wild > 0) {
      bgWildSpinTriggerCount++
      await handleBGWildWinsData(dice_Wild)
    }
  }
  if (winData.bonusPositions) {
    dice_Bonus = winData.after.total;
    if (dice_Bonus > 0) {
      bgBonusSpinTriggerCount++
      await handleBGBonusWinsData(dice_Bonus)
    }
  }
  return [dice_Wild, dice_Bonus];
}

function getDiceRespinWin(client) {
  return client.node.context.features.diceRoll.featureTriggered === 'Respin'
    ? client.node.context.features.respinWin : 0;
}

function updateBGTotals(dice_Wild, dice_Bonus, roundRespinWin, basegameWin) {
  totalDiceWild += dice_Wild;
  totalDiceBonus += dice_Bonus;
  totalRespinWin += roundRespinWin;
  totalBasegameWin += basegameWin;
}

function handleFSWinCalculation(client) {
  // Check if frees spins context exists
  if (client.node.context.freespins) {
    handleFSWin(client);
    handleFSDiceRespinWin(client);
  }

  // Handle FS Dice Wild & Bonus calculation
  if (client.node.context.features.fs_diceRoll) {
    handleFSDiceWinData(client);
  }
}

async function handleFSWin(client) {
  const fsWin = client.node.context.freespins.fsWin
  if (fsWin) {
    totalFSgameWin += fsWin
    client.node.context.freespins.fsWin = 0;
    await handleFGWinsData(fsWin)
  }
}

async function handleFSDiceRespinWin(client) {
  const respinWin = client.node.context.freespins.roundFsRespinWin
  if (respinWin > 0) {
    fgRespinSpinTriggerCount++
    totalFsRespinWin += respinWin;
    await handleFGRespinWinsData(respinWin)
    client.node.context.freespins.roundFsRespinWin = 0;
  }
}

async function handleFSDiceWinData(client) {
  const winData = client.node.context.features;
  if (winData.dice_Wild) {
    totalFsDiceWild += winData.dice_Wild;
    if (winData.dice_Wild > 0) {
      fgWildSpinTriggerCount++
      await handleFGWildWinsData(winData.dice_Wild)
    }
  }
  if (winData.dice_Bonus) {
    totalFsDiceBonus += winData.dice_Bonus;
    if (winData.dice_Bonus > 0) {
      fgBonusSpinTriggerCount++
      await handleFGBonusWinsData(winData.dice_Bonus)
    }
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
  features.prizePot.init(client);
}

module.exports = { execute };