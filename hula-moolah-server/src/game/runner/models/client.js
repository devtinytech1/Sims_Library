
const { round } = require('../../../utils/math')
const { triggers } = require('../configs/triggers')

module.exports.getClient = async function (requestData, init) {
  const client = {
    sessionId: requestData.sessionId,
    winCap: requestData.winCap,
    init,

    betMultiplier: requestData.betMultiplier,

    spinBet: 0,
    goldenBet: 1,

    gameId: init && init.settingsKey ?
      init.settingsKey :
      requestData.state && requestData.state.settingsKey ?
        requestData.state.settingsKey :
        'settings94',

    stamp: Date.now(),

    node: null,

    roundBet: 0,
    gameRoundOver: false,
    roundRestore: undefined,
    totalWin: 0,

    request: requestData.request,
    lastResponse: requestData.state ?
      typeof requestData.state === 'string' ?
        JSON.parse(requestData.state) :
        requestData.state :
      null,
  }

  if (!client.request.action) {
    client.request.action = triggers.init
  }

  client.setNode = val => {
    client.totalWin = 0
    val.spinBet = client.spinBet
    val.goldenBet = client.goldenBet
    val.spinTotal = client?.lastResponse?.spinTotal ? client.lastResponse.spinTotal : 0
    val.previousGameMetaMorphicLevel = client?.lastResponse?.currentGameMetaMorphicLevel ? client.lastResponse.currentGameMetaMorphicLevel : 0
    val.currentGameMetaMorphicLevel = client?.lastResponse?.currentGameMetaMorphicLevel ? client.lastResponse.currentGameMetaMorphicLevel : 0

    val.settingsKey = client.gameId
    if (requestData?.state?.stash) {
      if (requestData.state.stash.bets) {
        val.stash.bets = requestData.state.stash.bets.map(el => el)
      }
      if (requestData.state.stash.goldenBets) {
        val.stash.goldenBets = requestData.state.stash.goldenBets.map(el => el)
      }
      if (requestData.state.stash.defaultBet || requestData.state.stash.defaultBet === 0) {
        val.stash.defaultBet = requestData.state.stash.defaultBet
      }
    }
    client.node = val
  }

  client.addSpinTotal = value => {
    if (value) {
      client.node.spinTotal = round(client.node.spinTotal + value)
      client.totalWin = value
    }
  }

  client.setGameRoundOver = () => {
    client.gameRoundOver = true
  }

  if (client.request &&
    (client.request.action === triggers.spin || client.request.action === triggers.buy_bonus) &&
    client.lastResponse.trigger === triggers.spin) {
    if (client.request?.params?.goldenBet) {
      if (client.lastResponse.stash.goldenBets.includes(client.request.params.goldenBet)) {
        client.goldenBet = client.request.params.goldenBet
      }
      else {

      }
    }
    if (client.request?.params?.bet) {
      if (client.lastResponse.stash.bets.includes(client.request.params.bet)) {
        client.spinBet = client.request.params.bet
      }
      else {
        return Promise.reject('error_bet')
      }
    }
    else {
      return Promise.reject('error_bet')
    }
    return client
  }
  else if (client?.lastResponse?.spinBet) {
    client.spinBet = client.lastResponse.spinBet
    if (client.lastResponse.goldenBet) {
      client.goldenBet = client.lastResponse.goldenBet
    }
    return client
  }
  else if (client.request.action === triggers.init) {
    return client
  }
  else {
    return Promise.reject('error_bet')
  }
}
