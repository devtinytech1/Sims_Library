
const { response } = require('../compose')
const { keys } = require('../configs/keys')
const { triggers } = require('../configs/triggers')

const actions = {
  init: require('./actions/action_init_node.js'),
  spin: require('../../../../tools/simulations/sims.js'), 
}

module.exports.getNode = async function (client) {
  let count = 0
  async function checkTry(e) {
    return count < 4 ? await tryGet() : Promise.reject({ e, key: keys.try_limit })
  }
  async function tryGet() {
    count++
    try {
      client.setNode({ context: {}, stash: {} })
      if (actions[client.request.action]) {
        await actions[client.request.action].execute(client)
        if (client.node.trigger === triggers.spin) {
          client.setGameRoundOver()
        }
      }
      else {
        return Promise.reject(keys.invalid_action)
      }
      const diff = client.node.spinTotal - client.winCap * client.betMultiplier
      if (diff > 0) {
        client.totalWin -= diff
        client.node.spinTotal = client.winCap * client.betMultiplier
        client.node.context.winCap = true
      }

      return response(client)
    }
    catch (e) {
      console.log(e.message)
      console.log(e.stack)
      return await checkTry(e)
    }
  }
  return await tryGet()
}
