
const mathUtils = require('../../utils/math.cjs')
const { TRIGGER } = require('./configs/static.cjs')

function compose(client) {
  const data = {
    serverData: client.node,
    clientData: {
      context: {
        matrix: client.matrix,
        state: client.nextState,
        trigger: client.nextTrigger,
        spinTotal: client.node.spinTotal,
        spinBet: client.spinBet,
        isRespin: client.node.context.isRespin
      },
      cascade: client.cascade,
      win: {
        total: 0,
        type: 'regular',
      },
      features: {},
    },
  }
  if (client.context.features && client.context.features.diceRoll && client.nextTrigger !== TRIGGER.RESPIN) {
    data.clientData.lines = {
      beforeDiceMap: client.context.features.diceRoll.before,
      beforeDiceTotalWin: client.context.features.diceRoll.before.total,
      afterDiceMap: client.context.features.diceRoll.after,
      afterDiceTotalWin: client.context.features.diceRoll.after.total,
      totalWin: mathUtils.round(client.context.features.diceRoll.before.total + client.context.features.diceRoll.after.total),
    }
    data.clientData.win.total = mathUtils.round(data.clientData.lines.beforeDiceTotalWin + data.clientData.lines.afterDiceTotalWin);
  } else if (client.context.features && client.context.features.fs_diceRoll && client.nextTrigger !== TRIGGER.RESPIN) {
    data.clientData.lines = {
      beforeDiceMap: client.context.features.fs_diceRoll.before,
      beforeDiceTotalWin: client.context.features.fs_diceRoll.before.total,
      afterDiceMap: client.context.features.fs_diceRoll.after,
      afterDiceTotalWin: client.context.features.fs_diceRoll.after.total,
      totalWin: mathUtils.round(client.context.features.fs_diceRoll.before.total + client.context.features.fs_diceRoll.after.total),
    }
    data.clientData.win.total = mathUtils.round(data.clientData.lines.beforeDiceTotalWin + data.clientData.lines.afterDiceTotalWin);
  } else if (client.context.win || client.nextTrigger === TRIGGER.RESPIN) {
    data.clientData.lines = {
      map: client.context.win.lines,
      totalWin: client.context.win.total,
    }
    data.clientData.win.total = client.context.win.total;
  }

  if (client.context.wildRevealSymbol) {
    data.clientData.context.wildRevealSymbol = client.context.wildRevealSymbol
  }
  if (client.context.revealedSymbolsAndItsPositions) {
    data.clientData.context.revealedSymbolsAndItsPositions = client.context.revealedSymbolsAndItsPositions
  }
  if (client.context.stickyWildPosition) {
    data.clientData.context.stickyWildPosition = client.context.stickyWildPosition
  }
  if (client.context.multiplierForSymbols) {
    data.clientData.context.multiplierForSymbols = client.context.multiplierForSymbols
  }
  if (client.context.prevMultiplierForSymbols) {
    data.clientData.context.prevMultiplierForSymbols = client.context.prevMultiplierForSymbols
  }
  if (client.context.cascade_end_matrix) {
    data.clientData.context.cascade_end_matrix = client.context.cascade_end_matrix
  }
  if (client.context.unMatchedWild) {
    data.clientData.context.unMatchedWild = client.context.unMatchedWild
  }
  if (client.context.destroy) {
    data.clientData.context.destroy = client.context.destroy
  }
  if (client.context.win) {
    data.clientData.lines = {
      map: client.context.win.lines,
      totalWin: client.context.win.total,
    }
    data.clientData.win.total = client.context.win.total
    data.clientData.win.type = client.context.win.type
  }

  if (false) {
    const features = client.getFeatures()
    if (features) {
      data.clientData.features = features
      features.total && (data.clientData.win.total = mathUtils.round(data.clientData.win.total + features.total))
      features.bigWin && (data.clientData.win.type = features.bigWin.type)
    }
  }
  client.context.winCap && (data.clientData.winCap = true)
  client.context.freespins && (data.clientData.freespins = client.context.freespins)
  client.node.settings && (data.clientData.settings = client.node.settings)
  client.node.settingsKey && (data.clientData.settingsKey = client.node.settingsKey)

  return {
    data, totalBet: client.roundBet, gameRoundOver: client.gameRoundOver,
    totalWin: client.totalWin, roundRestore: client.roundRestore,
  }
}

module.exports = { compose }
