/* eslint-disable no-console */

const { saveCheatStats } = require('../cheat_controller')
const { checkSaveFileStatsOrCallBack } = require('../csv_controller')
const { saveDebugStats } = require('../debug')
const { saveUserStats } = require('../user_controller')

function getDoneAction(callback) {
  return async function action() {
    const file = checkSaveFileStatsOrCallBack(true)
    saveCheatStats()
    saveUserStats()
    saveDebugStats()
    console.log(file)
    if (callback) {
      callback()
    }
  }
}

module.exports = getDoneAction
