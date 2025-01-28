
const { triggers } = require('../../configs/triggers')

let endCount=0
module.exports.execute = async function (client) {  
  //console.log("action free spins end called:" + endCount++)
  if (client.lastResponse.trigger !== triggers.freespins_end || client.request.action !== triggers.freespins_end) {
    return Promise.reject('invalid_action')
  }

  client.node.state = client.lastResponse.context.freespins.on_end_state
  client.node.trigger = client.lastResponse.context.freespins.on_end_trigger
  client.node.context.matrix = []

  if(client.lastResponse.context.holdnspin)
  {
    client.node.context.holdnspin = client.lastResponse.context.holdnspin
  }

  client.node.context.matrix = client.lastResponse.context.freespins.fs_triggering_matrix
  if (client.node.trigger === triggers.spin) {
    client.setGameRoundOver()
  }
}
