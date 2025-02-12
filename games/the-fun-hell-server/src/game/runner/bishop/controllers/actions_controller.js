
const context = require('../models/context')
const doneAction = require('./actions/doneAction')
const initAction = require('./actions/initAction')
const spinAction = require('./actions/spinAction')
const wheelAction = require('./actions/wheelAction')


function cError(message) {
  // eslint-disable-next-line no-console
  console.error(message)
}

const triggers = { 
  spin: spinAction,
  bonus: wheelAction,
  bonus_end: spinAction
 }

function nextTrigger() {
  triggers[context.nextTrigger] ?
    triggers[context.nextTrigger]().then(nextTrigger, cError) :
    cError(`trigger:${context.nextTrigger}`)
}

module.exports = function (callback) {
  triggers.doneAction = doneAction(callback)
  initAction().then(nextTrigger, cError)
}
