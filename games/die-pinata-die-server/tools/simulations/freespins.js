const foundMatrix = require('../../../../src/game/runner/math/foundSymbols.cjs');
const baseSettings = require('../../../die-pinata-die-server/src/game/runner/configs/settings');
const matrix = require('../../src/game/runner/controllers/matrix_controller');
const roundWin = require('../../../../src/sims_data/round_win_controller.cjs');
const features = require('../../../../src/sims_data/features/features.cjs');
const respinData = require('../../tools/simulations/respin');

// To set the initial freespins model.
function setFreespinsModel(currentContext, allCount, addCount, leftCount) {
  currentContext.freespins = {
    all: allCount || 0,
    add: addCount || 0,
    left: leftCount || 0,
    total: 0,
    scatters: [],
    ind: 0,
  }
}

//To add freespins count to the current context.
function addFreespinsCount(currentContext, add) {
  if (currentContext.freespins) {
    currentContext.freespins.all += add
    currentContext.freespins.add += add
    currentContext.freespins.left += add
  }
}

// To check for scatter symbols in the free spins feature.
function scatterFS(client, matrix, settings) {
  const scatterSymbol = settings.scatters.triggerSymbol;
  const mask = foundMatrix.foundSymbols(matrix, scatterSymbol);
  const minScatterSymbols = settings.scatters.minTriggerCount;
  if (mask.length >= minScatterSymbols) {
    addFreespinsCount(client.context, mask.length)
  }
}

async function processFreespin(client, settings, isFsDiceTriggered) {
  client.matrix = await matrix.make(client, settings.reelsSet.sequenceMap.freespins_0, baseSettings.base.fsrows);
  client.context.freespins.left--;
  client.context.freespins.add = 0;

  let respinWin = 0;
  await handleFSWins(client);
  const diceRollTriggered = await features.fs_diceRoll.checkDiceRoll(client);
  if (diceRollTriggered) {
    await handleDiceRollFeature(client, settings, isFsDiceTriggered);
    await getDiceWinData(client);
    respinWin += getDiceRespinWin(client)
  }

  updateFGRespinTotals(client, respinWin);
}

function updateFGRespinTotals(client, respinWin) {
  client.node.context.freespins.roundFsRespinWin += respinWin
}

async function getDiceWinData(client) {
  const winData = client.node.context.features.fs_diceRoll;
  if (winData.wildPositions) {
    client.node.context.features.dice_Wild += winData.after.total
  }
  if (winData.bonusPositions) {
    client.node.context.features.dice_Bonus += winData.after.total
  }
}

function initializeFreespins(client) {
  client.node.context.freespins.roundFsRespinWin = 0;
  client.node.context.freespins.fsWin = 0;
  client.node.context.features.dice_Wild = 0
  client.node.context.features.dice_Bonus = 0
}

async function handleDiceRollFeature(client, settings, isFsDiceTriggered) {
  // Check the dice roll feature (Bonus, Wild, or Respin)
  await features.fs_diceRoll.checkDiceRollFeature(client);
  const winData = client.node.context.features.fs_diceRoll;
  if (winData.bonusPositions || winData.wildPositions) {
    winData.before = client.context.win;
    await roundWin.check(client);
    winData.after = client.context.win;
    winData.bonusPositions && scatterFS(client, client.matrix, settings.features.spin)
  } else if (winData.respinPositions) {
    isFsDiceTriggered = true;
    await respinData.execute(client, isFsDiceTriggered);
  }
}

function getDiceRespinWin(client) {
  return client.node.context.features.fs_diceRoll.featureTriggered === 'fs_ReSpin'
    ? client.node.context.features.respinWin : 0;
}

async function handleFSWins(client) {
  await roundWin.check(client)
  client.node.context.freespins.fsWin += client.node.context.win.total
}

//To initialize freespins feature with the number of freespins triggered.
async function initFreespins(client, mask, isFsDiceTriggered) {
  const add = mask.length
  setFreespinsModel(client.context, add, add, add)
  await execute(client, isFsDiceTriggered)
}

//Starting point of the action freespins
async function execute(client, isFsDiceTriggered) {
  const settings = baseSettings.get(client.gameId);
  initializeFreespins(client);
  while (client.context.freespins.left) {
    await processFreespin(client, settings, isFsDiceTriggered);
  }
}

module.exports = { execute, initFreespins }