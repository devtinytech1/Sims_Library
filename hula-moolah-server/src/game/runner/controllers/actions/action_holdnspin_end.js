
const { triggers } = require('../../configs/triggers')

let holdnspinendcount = 0
module.exports.execute = async function (client) {
  //console.log("hold n spin end called:"+ holdnspinendcount++)
  if (client.lastResponse.trigger !== triggers.holdnspin_end || client.request.action !== triggers.holdnspin_end) {
    return Promise.reject('invalid_action')
  }

  client.node.state = client.lastResponse.context.holdnspin.on_end_state
  client.node.trigger = client.lastResponse.context.holdnspin.on_end_trigger

  client.node.context.matrix = []

  if(client.lastResponse.context.freespins)
  {
    client.node.context.freespins = client.lastResponse.context.freespins
    if(client.lastResponse.context.freespins.left == 0 || client.lastResponse.context.winCap)
    {
      client.node.trigger = triggers.freespins_end
    }
  }
  
  client.node.context.matrix = client.lastResponse.context.holdnspin.hns_triggering_matrix

  if (client.node.trigger === triggers.spin) {
    client.setGameRoundOver()
  }
}
