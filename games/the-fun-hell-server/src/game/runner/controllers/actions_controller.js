
const mathUtils = require('../../../../../../src/utils/math.cjs')
const { compose } = require('../compose')
const { KEY, TRIGGER } = require('../../../../../../src/game/runner/configs/static.cjs')

const actions = {
  init: require('./actions/action_init.js'),
  spin: require('./../../../../tools/simulations/sims.js'),
}

module.exports.execute = async function (client) {
  let count = 0
  async function checkTry(e) {
    return count < 4 ? await tryGet() : Promise.reject({ e, key: KEY.TRY_LIMIT })
  }
  async function tryGet() {
    count++
    try {
      client.setNode({ context: {}, stash: {} })
      if (actions[client.request.action]) {
        await actions[client.request.action].execute(client)
        client.nextTrigger === TRIGGER.SPIN && client.setGameRoundOver()
      }
      else {
        return Promise.reject(KEY.INVALID_ACTION)
      }
      const diff = client.node.spinTotal - client.winCap * client.betMultiplier
      if (diff > 0) {
        client.totalWin = mathUtils.round(client.totalWin - diff)
        client.node.spinTotal = mathUtils.round(client.winCap * client.betMultiplier)
        client.context.winCap = true
      }

      return compose(client)
    }
    catch (e) {
      return await checkTry(e)
    }
  }
  return await tryGet()
}
