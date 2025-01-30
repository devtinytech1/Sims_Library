const configs = require('./configs')
const sender = require('./sender')

async function send(data) {
  const { name } = data
  const config = configs.get(name)
  return sender.execute(data, config)
}

module.exports = { send }
