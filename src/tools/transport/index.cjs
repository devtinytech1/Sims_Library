const configs = require('./configs/index.cjs')
const sender = require('./sender.cjs')

async function send(data) {
  const { name } = data
  const config = configs.get(name)
  return sender.execute(data, config)
}

module.exports = { send }
