
const { CHEATS } = require('../../../../../tools/bishop/cheats/models/static')
const { WIN, TRIGGER } = require('../../configs/static')

module.exports = {
  limit: 1,
  pool: [
    {
      name: 'mode_scatters_len3',
      pool: [
        {
          path: 'context.features.mode.isInitial',
          type: CHEATS.TYPE_EQUAL,
          value: true,
        },
      ],
    },
    {
      proto: 'collect_symbol_found',
      keys: ['count'],
      values: [[1], [2], [3]],
    },
    {
      proto: 'collect_trigger_symbol_found',
      keys: ['count'],
      values: [[1], [2], [3]],
    },
    {
      proto: 'BG_mode',
      keys: ['winType'],
      values: [
        [WIN.TYPE_BIG],
        [WIN.TYPE_MEGA],
        [WIN.TYPE_EPIC],
        [WIN.TYPE_SENSATIONAL],
      ],
    },
    {
      proto: 'BG',
      keys: ['winType'],
      values: [
        [WIN.TYPE_BIG],
        [WIN.TYPE_MEGA],
        [WIN.TYPE_EPIC],
        [WIN.TYPE_SENSATIONAL],
      ],
    },
    {
      proto: 'BG_randomWild',
      keys: ['wildsCount'],
      values: [[2], [5], [9], [14], [20]],
    },
    {
      proto: 'BG_collect',
      keys: ['values'],
      values: [[2], [5], [10], [15], [20], [25]],
    },
    {
      proto: 'BG_symbol',
      keys: ['countWays', 'sym', 'len', 'count'],
      values: [
        [1, 'H1', 3, 1],
        [1, 'H1', 4, 1],
        [1, 'H1', 5, 1],
        [1, 'H2', 3, 1],
        [1, 'H2', 4, 1],
        [1, 'H2', 5, 1],
        [1, 'H3', 3, 1],
        [1, 'H3', 4, 1],
        [1, 'H3', 5, 1],
        [1, 'H4', 3, 1],
        [1, 'H4', 4, 1],
        [1, 'H4', 5, 1],
        [1, 'H5', 3, 1],
        [1, 'H5', 4, 1],
        [1, 'H5', 5, 1],
        [1, 'L1', 3, 1],
        [1, 'L1', 4, 1],
        [1, 'L1', 5, 1],
        [1, 'L2', 3, 1],
        [1, 'L2', 4, 1],
        [1, 'L2', 5, 1],
        [1, 'L3', 3, 1],
        [1, 'L3', 4, 1],
        [1, 'L3', 5, 1],
        [1, 'L4', 3, 1],
        [1, 'L4', 4, 1],
        [1, 'L4', 5, 1],
      ],
    },
  ],
  proto: {
    collect_symbol_found: {
      name: 'collect_symbol_found_{count}',
      history: true,
      pool: [
        {
          path: 'context.features.collect.mask',
          type: CHEATS.TYPE_LENGTH,
          value: '{count}',
        },
      ],
    },
    collect_trigger_symbol_found: {
      name: 'collect_trigger_symbol_found_{count}',
      history: true,
      pool: [
        {
          path: 'context.features.collect.triggers',
          type: CHEATS.TYPE_LENGTH,
          value: '{count}',
        },
      ],
    },
    BG: {
      name: 'BG_winType_{winType}',
      history: true,
      pool: [
        {
          path: 'context.features.bigWin.type',
          type: CHEATS.TYPE_EQUAL,
          value: '{winType}',
        },
        {
          path: 'context.features',
          type: CHEATS.TYPE_ABSENT,
          value: 'mode',
        },
      ],
    },
    BG_mode: {
      name: 'BG_mode_winType_{winType}',
      history: true,
      pool: [
        {
          path: 'context.features.bigWin.type',
          type: CHEATS.TYPE_EQUAL,
          value: '{winType}',
        },
        {
          path: 'context.features',
          type: CHEATS.TYPE_EXISTS,
          value: 'mode',
        },
      ],
    },
    BG_randomWild: {
      name: 'BG_randomWild_wildsCount_{wildsCount}',
      history: true,
      pool: [
        {
          path: 'context.features.randomWild.mask',
          type: CHEATS.TYPE_LENGTH,
          value: '{wildsCount}',
        },
      ],
    },
    BG_collect: {
      name: 'BG_collect_values_{values}',
      history: true,
      pool: [
        {
          path: 'context.features.collect.values',
          type: CHEATS.TYPE_INCLUDES,
          value: '{values}',
        },
      ],
    },
    BG_symbol: {
      name: 'BG_sym_{sym}_len{len}',
      pool: [
        {
          path: 'state',
          type: CHEATS.TYPE_EQUAL,
          value: TRIGGER.SPIN,
        },
        {
          path: 'context.win.lines',
          type: CHEATS.TYPE_LENGTH,
          value: '{countWays}',
        },
        {
          path: 'context.win.lines',
          type: CHEATS.TYPE_RECURSIVE,
          value: [
            {
              path: 'symbol',
              type: CHEATS.TYPE_EQUAL,
              value: '{sym}',
            },
            {
              path: 'len',
              type: CHEATS.TYPE_EQUAL,
              value: '{len}',
            },
            {
              path: 'count',
              type: CHEATS.TYPE_EQUAL,
              value: '{count}',
            },
          ],
        },
      ],
    },
  },
  parse: (data, hook, key) => {
    if (key === '') {}
    return true
  },
  info: {
    currentTrigger: 'currentTrigger',
    nextTrigger: 'call.trigger',
    state: 'call.state',
    context: 'call.context',
  },
}
