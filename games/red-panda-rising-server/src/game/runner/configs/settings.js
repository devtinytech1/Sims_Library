
const settingsByKey = { settings94: require('./settings94') },
  { WIN } = require('../../../../../../src/game/runner/configs/static.cjs')

const base = {
  version: 'v1.0.0',
  defaultBet: 1,
  goldenBets: [1],
  bets: [0.25, 0.5, 0.75, 1, 2, 3, 4, 5, 7, 10, 12, 15, 20, 25, 30, 50, 75, 100],
  autoplay: [5, 10, 20, 50, 100, 200, 300, 400, 500, 1000],
  autoplay_limits_loss: [5, 10, 20, 50, 100, 1000],
  autoplay_limits_win: [5, 10, 20, 50, 100, 1000],

  batchValue: 10000,

  lines: [
    [1, 1, 1, 1, 1], // 1
    [0, 0, 0, 0, 0], // 2
    [2, 2, 2, 2, 2], // 3
    [2, 1, 0, 1, 2],
    [0, 1, 2, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 2, 2, 2, 1],
    [0, 0, 1, 2, 2],
    [2, 2, 1, 0, 0],
    [1, 0, 1, 2, 1],
    [1, 2, 1, 0, 1],
    [0, 1, 1, 1, 0],
    [2, 1, 1, 1, 2],
    [0, 1, 0, 1, 0],
    [2, 1, 2, 1, 2],
    [1, 0, 1, 0, 1],
    [1, 2, 1, 2, 1],
    [2, 2, 1, 2, 2],
    [0, 0, 1, 0, 0],
    [1, 1, 0, 1, 1],
    [1, 1, 2, 1, 1],
    [2, 0, 0, 0, 2],
    [0, 2, 2, 2, 0],
    [0, 2, 0, 2, 0],
    [2, 0, 2, 0, 2]
  ],

  linesType: 'lines',
  bigWin: [
    {
      key: WIN.TYPE_BIG,
      value: 15,
    },
    {
      key: WIN.TYPE_SUPER,
      value: 50,
    },
    {
      key: WIN.TYPE_MEGA,
      value: 100,
    },
    {
      key: WIN.TYPE_EPIC,
      value: 250,
    },
  ],
  rows: 3,
  cols: 5,
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
