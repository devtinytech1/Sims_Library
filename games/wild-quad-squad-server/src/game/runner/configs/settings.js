
const settingsByKey = { settings94: require('./settings94') },
  { WIN } = require('../../../../../../src/game/runner/configs/static.cjs')

const base = {
  version: 'v1.0.0',
  defaultBet: 4,
  goldenBets: [1],
  bets: [0.30, 0.60, 0.90, 1.20, 1.50, 2.00, 2.50, 3.00, 4.00, 5.00, 7.00, 10.00, 12.00, 15.00, 20, 25, 30, 50, 75, 100],
  autoplay: [5, 10, 20, 50, 100, 200, 300, 400, 500, 1000],
  autoplay_limits_loss: [5, 10, 20, 50, 100, 1000],
  autoplay_limits_win: [5, 10, 20, 50, 100, 1000],

  bigWin: [
    {
      key: WIN.TYPE_BIG,
      value: 10,
    },
    {
      key: WIN.TYPE_SUPER,
      value: 20,
    },
    {
      key: WIN.TYPE_MEGA,
      value: 35,
    },
    {
      key: WIN.TYPE_EPIC,
      value: 60,
    },
  ],
  rows: 6,
  cols: 6,
  minCluster: 5,
  wilds: ['W'],
  scatters: ['S'],
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
