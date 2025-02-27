const settingsByKey = { settings94: require('./settings94') }

const base = {
  version: 'v1.0.0',
  defaultBet: 1,
  goldenBets: [1],
  bets: [0.50, 1.00, 1.50, 2.00, 2.50, 3.00, 4.00, 5.00, 6.00, 7.00, 8.00, 10.00, 12.00, 15.00, 20.00, 25.00, 30.00, 50.00, 75.00, 100.00],
  autoplay: [5, 10, 20, 50, 100, 200, 300, 400, 500, 1000],
  autoplay_limits_loss: [5, 10, 20, 50, 100, 1000],
  autoplay_limits_win: [5, 10, 20, 50, 100, 1000],

  linesType: 'lines',
  bigWin: [
    { key: 'big', value: 20 },
    { key: 'mega', value: 50 },
    { key: 'epic', value: 100 },
    { key: 'sensational', value: 200 },
  ],
  rows: 4,
  cols: 5,
  wilds: ['W'],
  scatters: ['S'],
  winany: [],
  reelitemstoignore: [[0, 0], [4, 0]],
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
