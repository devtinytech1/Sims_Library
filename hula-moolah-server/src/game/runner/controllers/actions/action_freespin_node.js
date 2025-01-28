
const { round } = require('../../../../utils/math')
const baseSettings = require('../../configs/settings.js')
const { triggers } = require('../../configs/triggers')
const { check576Lines } = require('../lines_controller')
const { getMatrix } = require('../matrix_controller')
const { checkRoundWin } = require('../round_win_controller')
const baseSequences = require('../../configs/sequences')
const { holdnspinFeatureCheck } = require('../features/holdnspin_feature')
const { foundSymbols } = require('../../math/found_symbols')
const { checkMetamorphicMatrix } = require('../features/metamorphic_feature.js')

function setFreespinsModel(currentContext, allCount, addCount, leftCount, win, default_freespins_position, fs_triggering_matrix, state, trigger) {
  currentContext.freespins = {
    all: allCount || 0,
    add: addCount || 0,
    left: leftCount || 0,
    total: win || 0,
    scatters: [],
    ind: 0,
    fs_matrix: default_freespins_position || [],
    fs_triggering_matrix: JSON.parse(JSON.stringify(fs_triggering_matrix)),
    on_end_state: state,
    on_end_trigger: trigger,
    hnsWinInFS: 0
  }
}

function freespinsModelCopy(currentContext, lastContext) {
  if (lastContext.freespins) {
    currentContext.freespins = {}
    for (const key in lastContext.freespins) {
      currentContext.freespins[key] = lastContext.freespins[key]
    }
    currentContext.freespins.scatters = []
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

function initFreespins(client, mask, settings, state, trigger, isHoldnspinTriggered) {
  const add = settings.count
  if (!isHoldnspinTriggered)
    client.node.trigger = triggers.freespins

  const default_freespins_position = baseSequences.get(client.gameId)['default_freespins_position'];
  if (isHoldnspinTriggered) {
    client.node.context.holdnspin.on_end_trigger = triggers.freespins
  }
  setFreespinsModel(client.node.context, add, add, add, 0, default_freespins_position, client.node.context.matrix, state, trigger)
  client.node.context.freespins.scatters = mask
}

async function execute(client) {
  if (client.lastResponse.trigger !== triggers.freespins) {
    return Promise.reject('invalid_action')
  }

  if (client.lastResponse.context.freespins.left < 1) {
    return Promise.reject('invalid_left_count')
  }

  client.node.state = triggers.freespins
  client.node.trigger = triggers.freespins

  client.node.context.matrix = await getMatrix(client, `${triggers.freespins}_${client.lastResponse.context.freespins.ind}`, baseSettings.base.rows)
  client.node.context.matrix[0][0] = 'X'
  client.node.context.matrix[4][0] = 'X'

  const positionsOfW = [];
  client.node.context.matrix.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (value === 'W') {
        positionsOfW.push([rowIndex, colIndex]);
      }
    });
  });

  client.node.context.WildPresent = positionsOfW

  freespinsModelCopy(client.node.context, client.lastResponse.context)

  if (client.lastResponse.context.holdnspin) {
    client.node.context.holdnspin = client.lastResponse.context.holdnspin
  }

  const settings = baseSettings.get(client.gameId)

  const flattenedMatrix = client.node.context.matrix.flat();
  var isWildPresent = flattenedMatrix.includes('W');

  if (isWildPresent) {
    var isMetamorphic = await checkMetamorphicMatrix(client, client.node.context.matrix)
  }

  check576Lines(client, client.node.context.matrix)

  var isHoldnspinTriggered = false
  const triggerWin = client.node.context.win.total
  if (isWildPresent) {
    isHoldnspinTriggered = await holdnspinFeatureCheck(client, settings.features.holdnspin, client.node.state, client.node.trigger, triggerWin)
    if (isHoldnspinTriggered) {
      client.node.context.holdnspin.isFreeSpinsHNStriggered = true
    }
  }

  client.node.context.freespins.left--
  client.node.context.freespins.add = 0

  //To check retrigger the freespin
  scatterFS(client, client.node.context.matrix, settings.features.spin)

  //Arrange the win lines as per descending win value.
  if (client.node.context.win.lines.length > 0) {
    client.node.context.win.lines.sort((a, b) => b.win - a.win)
  }

  client.node.context.freespins.total = round(client.node.context.freespins.total + checkRoundWin(client))

  //winCap
  if (client.node.spinTotal >= round(client.winCap * client.betMultiplier)) {
    if (client.node.context.freespins.total >= round(client.winCap * client.betMultiplier)) {
      client.node.context.freespins.total = round(client.winCap * client.betMultiplier)
    }
    if (client.node.context.win.total >= round(client.winCap * client.betMultiplier)) {
      client.node.context.win.total = round(client.winCap * client.betMultiplier)
    }
    client.node.context.freespins.left = 0
    client.node.trigger = triggers.freespins_end
  }
  else if (client.node.context.freespins.left < 1 && !isHoldnspinTriggered) {
    client.node.trigger = triggers.freespins_end
  }
}

module.exports = { execute, initFreespins, addFreespinsCount }
