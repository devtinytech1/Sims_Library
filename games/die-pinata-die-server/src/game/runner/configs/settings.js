
const settingsByKey = { settings94: require('./settings94.js') },
  { WIN } = require('../../../../../../src/game/runner/configs/static.cjs')

const base = {
  version: 'v1.0.0',
  defaultBet: 3,
  goldenBets: [1],
  bets: [0.5, 1, 1.5, 2, 2.5, 3.5, 4, 4.5, 5, 6, 7, 8, 9, 10, 12.50, 15, 17.50, 20, 25, 30, 35, 40, 45, 50, 55, 60, 70, 80, 90, 100],
  autoplay: [5, 10, 20, 50, 100, 200, 300, 400, 500, 1000],
  autoplay_limits_loss: [5, 10, 20, 50, 100, 1000],
  autoplay_limits_win: [5, 10, 20, 50, 100, 1000],

  batchValue: 10000,

  bigWin: [
    { key: WIN.TYPE_BIG, value: 20 },
    { key: WIN.TYPE_SUPER, value: 50 },
    { key: WIN.TYPE_MEGA, value: 200 },
    { key: WIN.TYPE_EPIC, value: 350 },
  ],
  //Basegame rows according 6*4
  rows: 4,
  cols: 6,
  //Freespin rows according 6*6
  fsrows: 6,
  wilds: 'W',
  scatters: 'B',
  Special: 'S',
  Jackpot: 'J',
}

const get = function (key) {
  if (!key) {
    return settingsByKey.settings94
  }
  if (!settingsByKey[key]) {
    try {
      settingsByKey[key] = require('./' + key)
    }
    catch (e) {
      return settingsByKey.settings94
    }
  }
  return settingsByKey[key] ? settingsByKey[key] : settingsByKey.settings94
}

module.exports = { get, base }
