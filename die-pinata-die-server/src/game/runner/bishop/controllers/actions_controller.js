
const context = require('../models/context')
const doneAction = require('./actions/doneAction')
const initAction = require('./actions/initAction')
const spinAction = require('./actions/spinAction')
const { respinAction } = require('./actions/respinAction')
const freespinsAction = require('./actions/freespinsAction')

function cError(message) {
  // eslint-disable-next-line no-console
  console.error(message)  
}

const triggers = { 
  spin: spinAction,
  respin: respinAction,
  freespins: freespinsAction,
  freespins_end: spinAction,
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
 