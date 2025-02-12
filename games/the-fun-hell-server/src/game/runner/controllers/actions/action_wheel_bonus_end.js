const { KEY, TRIGGER } = require('../../../../../../../src/game/runner/configs/static.cjs')
const features = require('../features/features')

module.exports.execute = async function (client) {
  if (client.prevTrigger !== TRIGGER.BONUS_END) {
    return Promise.reject(KEY.INVALID_ACTION)
  }
  client.nextState = TRIGGER.SPIN
  client.nextTrigger = TRIGGER.SPIN

  features.init(client)
  client.matrix = []
  client.prevContext.matrix.forEach(reel => client.matrix.push([...reel]))
  
  client.node.context = client.lastResponse.context
  client.node.context.matrix = client.matrix
  if (client.nextTrigger === TRIGGER.SPIN) {
    client.setGameRoundOver()
  }
}
