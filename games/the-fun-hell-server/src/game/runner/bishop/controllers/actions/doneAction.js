/* eslint-disable no-console */

const context = require('../../models/context')
const maxWin = require('../../stats/maxWin')
const filesController = require('../csv_controller')

function getDoneAction(callback) {
  return async function action() {
    const file = filesController.finalize()
    maxWin.finalize()
    console.log(file)
    callback && callback()
    context.nextTrigger = 'done'
  }
}

module.exports = getDoneAction
