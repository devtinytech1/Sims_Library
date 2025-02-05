
const mathUtils = require('../utils/math.cjs')
const { KEY, TRIGGER } = require('../game/runner/configs/static.cjs')

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

    get matrix() {
      return this.node.context.matrix
    },
    set matrix(matrix) {
      return this.node.context.matrix = matrix
    },
    get context() {
      return this.node.context
    },
    get prevContext() {
      return this?.lastResponse?.context || {}
    },
    get prevState() {
      return this?.lastResponse?.state || TRIGGER.INIT
    },
    get prevTrigger() {
      return this?.lastResponse?.trigger || TRIGGER.INIT
    },
    get nextState() {
      return this.node.state
    },
    set nextState(value) {
      this.node.state = value
    },
    get nextTrigger() {
      return this.node.trigger
    },
    set nextTrigger(value) {
      this.node.trigger = value
    },
  }

  if (!client.request.action) {
    client.request.action = TRIGGER.INIT
  }

  client.setNode = val => {
    client.totalWin = 0
    val.spinBet = client.spinBet
    val.goldenBet = client.goldenBet
    val.spinTotal = client?.lastResponse?.spinTotal ? client.lastResponse.spinTotal : 0

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
      client.node.spinTotal = mathUtils.round(client.node.spinTotal + value)
      client.totalWin =  mathUtils.round(value)
      if(client.context.features && client.context.features.diceRoll && client.nextTrigger != TRIGGER.RESPIN){
        client.totalWin =  mathUtils.round(client.node.spinTotal)
      }else if(client.context.features && client.context.features.fs_diceRoll && client.nextTrigger != TRIGGER.RESPIN){
        client.totalWin =  mathUtils.round(value + (client.context.features.fs_diceRoll.before.total || 0))
      }
    }
    return value
  }

  client.setGameRoundOver = () => client.gameRoundOver = true

  if (client.request &&
    (client.request.action === TRIGGER.SPIN || client.request.action === TRIGGER.BUY_BONUS) &&
    client.prevTrigger === TRIGGER.SPIN) {
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
        return Promise.reject(KEY.INVALID_BET)
      }
    }
    else {
      return Promise.reject(KEY.INVALID_BET)
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
  else if (client.request.action === TRIGGER.INIT) {
    return client
  }
  else {
    return Promise.reject(KEY.INVALID_BET)
  }
}
