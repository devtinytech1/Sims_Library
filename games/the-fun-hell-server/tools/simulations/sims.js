const baseSettings = require('../../src/game/runner/configs/settings');
const { TRIGGER } = require('../../../../src/game/runner/configs/static.cjs');
const matrix = require('../../src/game/runner/controllers/matrix_controller');
const roundWin = require('../../tools/simulations/round_win_controller');
const { round } = require('../../../../src/utils/math.cjs');
const features = require('../../tools/simulations/features/features');
const respinData = require('../../tools/simulations/respin');
const { scatterFeatureCheck } = require('../../tools/simulations/features/scatters_feature');
const { logRoundStats, logFeatureRTP } = require('../../../the-fun-hell-server/tools/simulations/LogFiles/logRTPData');
const { handleBGWinsData, logNoWinNoFeatureFrequency } = require('./LogFiles/logBGData');

let totalBasegameWin = 0;

let totalFSgameWin = 0;

// let Mini = 0, Minor = 0, Major = 0, Grand = 0;
// let totalMiniSpinsTriggered = 0, totalMinorSpinsTriggered = 0, totalMajorSpinsTriggered = 0, totalGrandSpinsTriggered = 0;

// let isFsDiceTriggered = false;
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
    if ((i + 1) % 100000 === 0) {
      logRoundData(i + 1, client, bgTotalWin, fgTotalWin);
    }
  }
}

// function incrementTriggers() {
//   totalMiniSpinsTriggered++;
//   totalMinorSpinsTriggered++;
//   totalMajorSpinsTriggered++;
//   totalGrandSpinsTriggered++;
// }

function logRoundData(i, client, bgTotalWin, fgTotalWin, jpTotalWin) {
  const logParams = {
    round: i + 1,
    client: client,
    // Mini: Mini,
    // Minor: Minor,
    // Major: Major,
    // Grand: Grand,
    // totalDiceWild: totalDiceWild,
    // totalDiceBonus: totalDiceBonus,
    // totalRespinWin: totalRespinWin,
    totalBasegameWin: totalBasegameWin,
    // totalFsDiceWild: totalFsDiceWild,
    // totalFsDiceBonus: totalFsDiceBonus,
    // totalFsRespinWin: totalFsRespinWin,
    totalFSgameWin: totalFSgameWin
  };
  logRoundStats(i + 1, client.node.spinBet, bgTotalWin, fgTotalWin);
  logFeatureRTP(i + 1, client, logParams);
  logNoWinNoFeatureFrequency(i + 1, client.node.spinBet, totalSpins)
  // logMiniFeatureFrequency(i + 1, client.node.spinBet, totalSpins, totalMiniSpinsTriggered)
  // logMinorFeatureFrequency(i + 1, client.node.spinBet, totalSpins, totalMinorSpinsTriggered)
  // logMajorFeatureFrequency(i + 1, client.node.spinBet, totalSpins, totalMajorSpinsTriggered)
  // logGrandFeatureFrequency(i + 1, client.node.spinBet, totalSpins, totalGrandSpinsTriggered)
}

function initializeClient(client) {
  client.roundBet = client.spinBet;
  client.nextState = TRIGGER.SPIN;
  client.nextTrigger = TRIGGER.SPIN;
  client.node.spinTotal = 0;
  features.init(client);
  // features.prizePot.init(client);
}

function calculateBgTotalWin() {
  return totalBasegameWin
}

function calculateFgTotalWin() {
  return totalFSgameWin
}

// function calculateJpTotalWin() {
//   return Mini + Minor + Major + Grand;
// }

async function playRound(client, settings) {
  client.matrix = await matrix.make(client, settings.reelsSet.sequenceMap.MainBoard, baseSettings.base.rows);

  let basegameWin = 0;
  await handleBGWins(client);
  basegameWin = client.node.context.basegameWin
  //Calulate Hit Frequency with RTP
  await handleBGWinsData(basegameWin)
  //Calculate Jackpot levels Hit Frequency with RTP
  // await prizePotCalulation(client);
  // Check if the dice roll feature is triggered
  // const diceRollTriggered = await features.diceRoll.checkDiceRoll(client);
  // if (diceRollTriggered) {
  //   await handleDiceRollFeature(client);
  //   [dice_Wild, dice_Bonus] = getDiceWinData(client);
  //   roundRespinWin = getDiceRespinWin(client);
  // }
  await scatterFeatureCheck(client, settings.features.spin);
  //Calculate basegame wins with dice features
  updateBGTotals(basegameWin);
  //Freespins calculation
  handleFSWinCalculation(client);
  maxWinCap(client);
  //Jackpot Data Reinitialized
  resetClientState(client);
}

// async function prizePotCalulation(client) {
//   if (client.node.context.features.prizePot.level === 0 && client.node.context.features.prizePot.win > 0) {
//     await handleJPMiniWinsData(client.node.context.features.prizePot.win)
//   }
//   if (client.node.context.features.prizePot.level === 1 && client.node.context.features.prizePot.win > 0) {
//     await handleJPMinorWinsData(client.node.context.features.prizePot.win)
//   }
//   if (client.node.context.features.prizePot.level === 2 && client.node.context.features.prizePot.win > 0) {
//     await handleJPMajorWinsData(client.node.context.features.prizePot.win)
//   }
//   if (client.node.context.features.prizePot.level === 3 && client.node.context.features.prizePot.win > 0) {
//     await handleJPGrandWinsData(client.node.context.features.prizePot.win)
//   }
// }

async function handleBGWins(client) {
  // features.prizePot.accumulation(client);
  // features.prizePot.check(client);
  // await handlePrizePotLevel(client);
  await roundWin.check(client);
}

// async function handlePrizePotLevel(client) {
//   const level = client.node.context.features.prizePot.level;
//   const winAmount = client.node.context.features.prizePot.win;
//   if (winAmount > 0) {
//     switch (level) {
//       case 0:
//         Mini += winAmount;
//         break;
//       case 1:
//         Minor += winAmount;
//         break;
//       case 2:
//         Major += winAmount;
//         break;
//       case 3:
//         Grand += winAmount;
//         break;
//       default:
//         break;
//     }
//   }
// }

// async function handleDiceRollFeature(client) {
//   // Check the dice roll feature (Bonus, Wild, or Respin)
//   await features.diceRoll.checkDiceRollFeature(client);
//   const winData = client.node.context.features.diceRoll;
//   if (winData.bonusPositions || winData.wildPositions) {
//     winData.before = client.context.win;
//     await roundWin.check(client);
//     winData.after = client.context.win;
//   } else if (winData.respinPositions) {
//     await respinData.execute(client, isFsDiceTriggered);
//   }
// }

// function getDiceWinData(client) {
//   const winData = client.node.context.features.diceRoll;
//   let dice_Wild = 0, dice_Bonus = 0;
//   if (winData.wildPositions) dice_Wild = winData.after.total;
//   if (winData.bonusPositions) dice_Bonus = winData.after.total;
//   return [dice_Wild, dice_Bonus];
// }

// function getDiceRespinWin(client) {
//   return client.node.context.features.diceRoll.featureTriggered === 'Respin'
//     ? client.node.context.features.respinWin : 0;
// }

function updateBGTotals(basegameWin) {
  // totalDiceWild += dice_Wild;
  // totalDiceBonus += dice_Bonus;
  // totalRespinWin += roundRespinWin;
  totalBasegameWin += basegameWin;
}

function handleFSWinCalculation(client) {
  // Check if frees spins context exists
  if (client.node.context.features && client.node.context.features.wheel) {
    handleFSWin(client.node.context.features.wheel.wheel, client);
    // handleFSDiceRespinWin(client);
  }

  // Handle FS Dice Wild & Bonus calculation
  // if (client.node.context.features.fs_diceRoll && client.node.context.features.fs_diceRoll.after) {
  //   handleFSDiceWinData(client);
  // }
}

function handleFSWin(wheel, client) {
  for (let i = 0; i < wheel.length; i++) {
    totalFSgameWin += wheel[i].value[0] * client.spinBet
  }
  // const fsWin = client.node.context.freespins.fsWin
  // if (fsWin) {
  //   totalFSgameWin += fsWin
  //   client.node.context.freespins.fsWin = 0;
  // }
}

// function handleFSDiceRespinWin(client) {
//   const respinWin = client.node.context.freespins.roundFsRespinWin
//   if (respinWin) {
//     totalFsRespinWin += respinWin;
//     client.node.context.freespins.roundFsRespinWin = 0;
//   }
// }

// function handleFSDiceWinData(client) {
//   const winData = client.node.context.features.fs_diceRoll;
//   if (winData.wildPositions) totalFsDiceWild += winData.after.total;
//   if (winData.bonusPositions) totalFsDiceBonus += winData.after.total;
// }

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
  // features.prizePot.init(client);
}

module.exports = { execute };