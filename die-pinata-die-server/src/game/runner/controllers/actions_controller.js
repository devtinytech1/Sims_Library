
const mathUtils = require('../../../utils/math')
const { compose } = require('../compose')
const { KEY, TRIGGER } = require('../configs/static')

const actions = {
  init: require('./actions/action_init.js'),
  spin: require('../../../../tools/simulations/sims'),
  // spin: require('./actions/action_spin.js'),
  // respin: require('./actions/action_respin.js'),
  // freespins: require('./actions/action_freespins.js'),
  // freespins_end: require('./actions/action_freespins_end.js'),
  // buy_bonus: require('./actions/action_buy_bonus.js'),
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
