
const baseSettings = require('../../configs/settings.js')
const { TRIGGER } = require('../../configs/static')
const features = require('../features/features')
const linesController = require('../lines_controller')
const matrix = require('../matrix_controller')

module.exports.execute = async function (client) {

  try {
    const settings = baseSettings.get(client.gameId)

    client.node.settings = {
      set: settings.name,
      autoplay: baseSettings.base.autoplay.map(el => el),
      autoplay_limits_loss: baseSettings.base.autoplay_limits_loss.map(el => el),
      autoplay_limits_win: baseSettings.base.autoplay_limits_win.map(el => el),
      paytable: settings.paytable,
      lines: baseSettings.base.lines,
      buyBonusMultiplier: settings.buyBonusMultiplier,
      be: baseSettings.base.version,
    }

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
      client.node.context = { matrix: await matrix.make(client,  TRIGGER.SPIN, baseSettings.base.rows) }
      linesController.makeWinModel(client, client.context)
      client.nextState = state
      client.nextTrigger = trigger || state
      features.init(client)
    }

    if (client.lastResponse && client.lastResponse.context) {
      client.node.context = client.lastResponse.context
      if (!client.matrix) {
        await runBoardGeneration(client.prevState, client.prevTrigger)
      }
      else {
        client.nextTrigger = client.prevTrigger
        client.nextState = client.prevState
        if (client.nextState !== TRIGGER.SPIN) {
          client.roundRestore = true
        }
        client.getWinModel = () => client.context?.win || {}
        client.getFeatures = () => client.context?.features || {}
      }
    }
    else {
      await runBoardGeneration(TRIGGER.SPIN)
    }
  }
  catch (e) {
    return Promise.reject(e)
  }

}
