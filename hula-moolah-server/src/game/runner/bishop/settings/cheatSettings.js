
const settings = require('./bishopSettings')

module.exports = {
  limit: 1,
  pool: [
    {
      name: 'BG_big_win',
      pool: [
        {
          path: 'state',
          type: '===',
          value: 'spin',
        },
        {
          path: 'context.win.type',
          type: '===',
          value: 'big',
        },
      ],
    },
    {
      name: 'BG_mega_win',
      pool: [
        {
          path: 'state',
          type: '===',
          value: 'spin',
        },
        {
          path: 'context.win.type',
          type: '===',
          value: 'mega',
        },
      ],
    },
    {
      name: 'BG_epic_win',
      pool: [
        {
          path: 'state',
          type: '===',
          value: 'spin',
        },
        {
          path: 'context.win.type',
          type: '===',
          value: 'epic',
        },
      ],
    },
    {
      name: 'BG_sensational_win',
      pool: [
        {
          path: 'state',
          type: '===',
          value: 'spin',
        },
        {
          path: 'context.win.type',
          type: '===',
          value: 'sensational',
        },
      ],
    },

    {
      name: 'BG_freespins',
      pool: [
        {
          path: 'trigger',
          type: '===',
          value: settings.keys.freespins,
        },
        {
          path: 'currentTrigger',
          type: '===',
          value: settings.keys.spin,
        },
      ],
    },

    {
      name: 'BG_reveal',
      pool: [
        {
          path: 'context.features.symbolReveal.mask',
          type: 'length',
          value: 3,
        },
      ],
    },
  ],
  parse: (data, hook, key) => {
    if (key === '') {}
    return true
  },
}
