const { SETTINGS_KEY, BISHOP_ITERATIONS, BISHOP_FILE_UPDATE, BISHOP_CONSOLE_UPDATE, BISHOP_BUYBONUS_ENABLED, BISHOP_BUYBONUS_SELECT_OPTION, BISHOP_LOG_FILE } = process.env

module.exports = {
  url: 'http://localhost:3000',
  settingsKey: SETTINGS_KEY ? SETTINGS_KEY : 'settings94',
  out: './out/',
  endpoints: {
    init: '/base',
    play: '/base',
  },
  iterationsCount: BISHOP_ITERATIONS ? parseInt(BISHOP_ITERATIONS) : 15000000000,
  bet: 1,
  goldenBet: 0,
  consoleUpdateOnEveryStep: BISHOP_CONSOLE_UPDATE ? parseInt(BISHOP_CONSOLE_UPDATE) : 1000000,
  updateRtpMap: 10000,
  fileUpdateOnEveryStep: BISHOP_FILE_UPDATE ? parseInt(BISHOP_FILE_UPDATE) : 1000000,
  deviationGroup: [0, 0.5, 1, 2, 5, 10, 20, 30, 40, 50, 100, 500, 1000, 5000, 10000, 20000, 50000, 100000],

  userStats: {
    balance: 500,
    limits: {
      spin: { count: 1000 },
      win: {
        max: 500,
        spin: 1000,
        total: 10000,
      },
    },
  },

  buyBonus: {
    type: 'random',
    weights: [0, 10],
  },

  keys: {
    freespins: 'freespins',
    holdnspin: 'holdnspin',
    spin: 'spin',
    freespins_end: 'freespins_end',
    holdnspin_end: 'holdnspin_end',
    init: 'init',
    buy_bonus: 'buy_bonus',
  },

  actions: {
    spin: 'spin',
    freespins_end: 'freespins_end',
    freespins: 'freespins',
    holdnspin: 'holdnspin',
    holdnspin_end: 'holdnspin_end',
    buy_bonus: 'buy_bonus',
  },
  linesLength: line => line.mask.length,
  buyBonusEnabled: BISHOP_BUYBONUS_ENABLED ? parseInt(BISHOP_BUYBONUS_ENABLED) : 0, //1 is true or 0 for false
  buyBonusSelectOption: BISHOP_BUYBONUS_SELECT_OPTION ? parseInt(BISHOP_BUYBONUS_SELECT_OPTION) : 0, //Which Buy Bonus Option is selected 0 for first option
  bishopLogsFiles: BISHOP_LOG_FILE ? BISHOP_LOG_FILE : "./logs/draft_rtp_logs.json"
}
