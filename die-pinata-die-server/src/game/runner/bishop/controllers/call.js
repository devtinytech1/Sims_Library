
const { TRIGGER } = require('../../configs/static')
const actions = require('../../controllers/actions_controller')
const { getClient } = require('../../models/client')
const context = require('../models/context')
const mathUtils = require('../utils/math')

let lastResponse = {}

const { BISHOP_DEBUG_ON } = process.env
let model
if (BISHOP_DEBUG_ON === 'true') {
  model = {
    in: 0,
    out: 0,
    rounds: 0,
  }
  context.getDebug().rgs = model
}

module.exports = async function (body, init) {
  context.currentTrigger = context.call.trigger || TRIGGER.INIT
  context.currentAction = body.action
  context.currentState = context.call.state || TRIGGER.SPIN
  const client = await getClient({
    sessionId: context.bishopID,
    request: body,
    state: lastResponse,
    winCap: 1000000000,
    betMultiplier: 1,
  }, init)
  const { data, totalBet, gameRoundOver, totalWin, roundRestore } = await actions.execute(client)
  if (BISHOP_DEBUG_ON === 'true') {
    model.in += totalBet || 0
    model.out += totalWin
    if (gameRoundOver) {
      model.rounds ++
      model.rtp = mathUtils.round(model.out / model.in)
    }
  }
  lastResponse = data.serverData
  context.call = Object.assign(lastResponse, { totalBet })
  context.nextTrigger = context.call.trigger
  context.nextState = context.call.state
  context.win = 0
  return { data: lastResponse, gameState: lastResponse, totalBet, gameRoundOver, totalWin, roundRestore }
}
