const uuid = require('uuid')

function execute() {
  const response = {
    sessionId: uuid.v4(),
    username: Date.now(),
  }
  return response
}

module.exports = execute
