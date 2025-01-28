
const doneAction = require('./actions/doneAction')
const freespinsAction = require('./actions/freespinsAction')
const initAction = require('./actions/initAction')
const spinAction = require('./actions/spinAction')
const holdnspinAction = require('./actions/holdnspinAction')

function cError(message) {
  // eslint-disable-next-line no-console
  console.error(message)
}

const triggers = {
  spin: spinAction,
  freespins: freespinsAction,
  freespins_end: spinAction,
  holdnspin: holdnspinAction,
  holdnspin_end: spinAction,
}

function nextTrigger(trigger) {
  // eslint-disable-next-line no-unused-expressions
  triggers[trigger] ?
    triggers[trigger](trigger).then(nextTrigger, cError) :
    cError(`trigger:${trigger}`)
}

module.exports = function (callback) {
  triggers.doneAction = doneAction(callback)
  initAction().then(nextTrigger, cError)
}
