const baseSettings = require('../../configs/settings.js')
const { TRIGGER } = require('../../../../../../../src/game/runner/configs/static.cjs')
const matrix = require('../matrix_controller.js')

module.exports.execute = async function (client) {

  const settings = baseSettings.get(client.gameId)

  client.node.settings = {
    set: settings.name,
    autoplay: baseSettings.base.autoplay.map(el => el),
    autoplay_limits_loss: baseSettings.base.autoplay_limits_loss.map(el => el),
    autoplay_limits_win: baseSettings.base.autoplay_limits_win.map(el => el),
    paytable: settings.paytable,
    lines: baseSettings.base.lines,
    be: baseSettings.base.version,
  }

  client.node.settings.buyBonusBetMultiplier = client.init && client.init.buyBonusBetMultiplier ?
    client.init.buyBonusBetMultiplier :
    settings.buyBonusBetMultiplier

  client.node.settings.bets = client.init && client.init.bets ?
    client.init.bets.map(el => el) :
    baseSettings.base.bets.map(el => el)

  client.node.settings.goldenBets = client.init && client.init.goldenBets ?
    [...client.init.goldenBets] :
    [...baseSettings.base.goldenBets]

  client.node.settings.defaultBet = client.init && client.init.defaultBet != null ?
    client.init.defaultBet :
    baseSettings.base.defaultBet

  client.node.stash.bets = client.node.settings.bets.map(el => el)
  client.node.stash.goldenBets = client.node.settings.goldenBets.map(el => el)
  client.node.stash.defaultBet = client.node.settings.defaultBet

  async function runBoardGeneration(state, trigger) {
    client.node.context = { matrix: await matrix.make(client, TRIGGER.SPIN, baseSettings.base.rows) }
    client.node.state = state
    client.node.trigger = trigger || state
  }

  if (client.lastResponse && client.lastResponse.context) {
    client.node.context = client.lastResponse.context
    if (!client.node.context.matrix) {
      await runBoardGeneration(client.lastResponse.state, client.lastResponse.trigger)
    }
    else {
      client.node.trigger = client.lastResponse.trigger
      client.node.state = client.lastResponse.state
      if (client.node.state !== TRIGGER.SPIN) {
        client.roundRestore = true
      }
    }
  }
  else {
    await runBoardGeneration(TRIGGER.SPIN)
  }

}

