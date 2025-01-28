const baseSettings = require('../../src/game/runner/configs/settings.js')
const { check576Lines } = require('../../src/game/runner/controllers/lines_controller')
const { getMatrix } = require('../../src/game/runner/controllers/matrix_controller')
const { checkRoundWin } = require('../../tools/simulations/round_win_controller')
const baseSequences = require('../../src/game/runner/configs/sequences')
const { holdnspinFeatureCheck } = require('../../tools/simulations/features/holdnspin_feature.js')
const { foundSymbols } = require('../../src/game/runner/math/found_symbols')

function setFreespinsModel(currentContext, allCount, addCount, leftCount, win, default_freespins_position, fs_triggering_matrix) {
  currentContext.freespins = {
    all: allCount || 0,
    add: addCount || 0,
    left: leftCount || 0,
    total: win || 0,
    scatters: [],
    ind: 0,
    fs_matrix: default_freespins_position || [],
    fs_triggering_matrix: JSON.parse(JSON.stringify(fs_triggering_matrix)),
  }
}

function addFreespinsCount(currentContext, add, mask) {
  if (currentContext.freespins) {
    currentContext.freespins.all += add
    currentContext.freespins.add += add
    currentContext.freespins.left += add
    currentContext.freespins.scatters = mask
  }
}

// To check for scatter symbols in the free spins feature.
function scatterFS(client, matrix, settings) {
  const scatterSymbol = settings.scatters.symbol;
  const mask = foundSymbols(client, matrix, scatterSymbol)
  const minScatterSymbols = settings.scatters.triggers[0].found;
  if (mask.length >= minScatterSymbols) {
    if (mask.length >= settings.scatters.triggers[2].found) {
      addFreespinsCount(client.node.context, settings.scatters.triggers[2].count, mask)
    } else if (mask.length === 4) {
      addFreespinsCount(client.node.context, settings.scatters.triggers[1].count, mask)
    } else {
      addFreespinsCount(client.node.context, settings.scatters.triggers[0].count, mask)
    }
  }
}

async function initFreespins(client, mask, settings) {
  const add = settings.count
  const default_freespins_position = baseSequences.get(client.gameId)['default_freespins_position'];
  setFreespinsModel(client.node.context, add, add, add, 0, default_freespins_position, client.node.context.matrix)
  await execute(client)
}

let fstotalWin = 0
//Starting point of the freespins
async function execute(client) {
  if (client.node.context.win !== undefined) {
    delete client.node.context.win;
  }
  while (client.node.context.freespins.left) {
    await processFreespin(client);
    if (client.node.context.win !== undefined) {
      delete client.node.context.win;
    }
  }
  reInitializeFSWins(client)
}

function reInitializeFSWins(client) {
  client.node.context.freespins.fsWin = fstotalWin
  fstotalWin = 0
}

let triggerWin = 0
async function processFreespin(client) {
  await createMatrix(client)
  let isWildPresent = isWildPresentInMatrix(client)
  check576Lines(client)
  await checkRoundWin(client)
  decreaseFSSpins(client)
  await toCheckFeature(client, isWildPresent)
  await updateTotals(client)
}

async function createMatrix(client) {
  client.node.context.matrix = await getMatrix(client, 'freespins_0', baseSettings.base.rows)
  client.node.context.matrix[0][0] = 'X'
  client.node.context.matrix[4][0] = 'X'
}

function isWildPresentInMatrix(client) {
  const flattenedMatrix = client.node.context.matrix.flat();
  let isWildPresent = flattenedMatrix.includes('W');
  return isWildPresent
}

function decreaseFSSpins(client) {
  client.node.context.freespins.left--
  client.node.context.freespins.add = 0
}

async function toCheckFeature(client, isWildPresent) {
  const settings = baseSettings.get(client.gameId)
  let triggerWin = client.node.context.win.total
  let hnsTriggeredInFG = false
  if (isWildPresent) {
    hnsTriggeredInFG = true
    let isHNSTriggered = await holdnspinFeatureCheck(client, settings.features.holdnspin, triggerWin, false, hnsTriggeredInFG)
    if (isHNSTriggered) {
      client.node.context.hnsSpinTriggerCount++
    }
  }
  // To check retrigger the freespin
  scatterFS(client, client.node.context.matrix, settings.features.spin)
}

async function updateTotals(client) {
  if (!client.node.context.win) {
    fstotalWin += triggerWin
  } else {
    fstotalWin += client.node.context.win.total
  }
}
module.exports = { execute, initFreespins, addFreespinsCount }
