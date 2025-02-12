
const settingsByKey = { settings94: require('./settings94') },
  { WIN } = require('./static')

const base = {
  version: 'v1.0.0',
  defaultBet: 1,
  goldenBets: [1],
  bets: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  autoplay: [5, 10, 20, 50, 100, 200, 300, 400, 500, 1000],
  autoplay_limits_loss: [5, 10, 20, 50, 100, 1000],
  autoplay_limits_win: [5, 10, 20, 50, 100, 1000],

  batchValue: 10000,
  lines: [
    [1, 1, 1], // 1
    [0, 0, 0], // 2
    [2, 2, 2], // 3
    [0, 1, 2], // 4
    [2, 1, 0], // 5
    [0, 1, 0], // 6
    [2, 1, 2], // 7
    [1, 2, 1], // 8
    [1, 0, 1]  // 9
  ],

  linesType: 'lines',
  bigWin: [
    {
      key: WIN.TYPE_BIG,
      value: 15,
    },
    {
      key: WIN.TYPE_SUPER,
      value: 30,
    },
    {
      key: WIN.TYPE_MEGA,
      value: 60,
    },
    {
      key: WIN.TYPE_EPIC,
      value: 120,
    },
  ],
  rows: 3,
  cols: 3,
  wilds: ['W1', 'W2', 'W3'],
  WI: ['W1', 'W2', 'W3'],
  scatters: ['B'],
  jackpot: 'J',
  blank: ['U'],
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
