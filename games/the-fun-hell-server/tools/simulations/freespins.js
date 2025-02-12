
const foundMatrix = require('../../src/game/runner/controllers/matrix_controller')
const baseSequences = require('../../src/game/runner/configs/sequences')
const baseSettings = require('../../src/game/runner/configs/settings');
const matrix = require('../../src/game/runner/controllers/matrix_controller');
const roundWin = require('../../tools/simulations/round_win_controller');
const features = require('../../src/game/runner/controllers/features/features');
const respinData = require('../../tools/simulations/respin');

// To set the initial freespins model.
function setFreespinsModel(currentContext, allCount, addCount, leftCount, default_freespins_position, fs_triggering_matrix) {
  currentContext.freespins = {
    all: allCount || 0,
    add: addCount || 0,
    left: leftCount || 0,
    total: 0,
    scatters: [],
    ind: 0,
    fs_matrix: default_freespins_position || [],
    fs_triggering_matrix: JSON.parse(JSON.stringify(fs_triggering_matrix)),
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

  let dice_Bonus = 0, dice_Wild = 0, respinWin = 0;
  await handleFSWins(client);
  const diceRollTriggered = await features.fs_diceRoll.checkDiceRoll(client);
  if (diceRollTriggered) {
    await handleDiceRollFeature(client, settings, isFsDiceTriggered);
    [dice_Wild, dice_Bonus] = getDiceWinData(client);
    respinWin += getDiceRespinWin(client)
  }

  updateBGTotals(client, dice_Wild, dice_Bonus, respinWin);
}

function updateBGTotals(client, dice_Wild, dice_Bonus, respinWin) {
  if(client.node.context.features.fs_diceRoll && client.node.context.features.fs_diceRoll.after){
    client.node.context.features.fs_diceRoll.after.total += (dice_Wild + dice_Bonus);
  }
  client.node.context.freespins.roundFsRespinWin += respinWin
}

function getDiceWinData(client) {
  const winData = client.node.context.features.fs_diceRoll;
  let dice_Wild = 0, dice_Bonus = 0;
  if (winData.wildPositions) dice_Wild = winData.after.total;
  if (winData.bonusPositions) dice_Bonus = winData.after.total;
  return [dice_Wild, dice_Bonus];
}

function initializeFreespins(client) {
  client.node.context.freespins.roundFsRespinWin = 0;
  client.node.context.freespins.fsWin = 0;
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
async function initFreespins(client, fs_triggering_matrix, mask, isFsDiceTriggered) {
  const add = mask.length
  const default_freespins_position = baseSequences.get(client.gameId)['default_freespins_position'];
  setFreespinsModel(client.context, add, add, add, default_freespins_position, fs_triggering_matrix)
  client.context.freespins.scatters = mask
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