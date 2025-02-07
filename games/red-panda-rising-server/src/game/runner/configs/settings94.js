const { TRIGGER } = require('./static')

module.exports = {
  name: '96',
  buyBonusBetMultiplier: 1,
  buyBonusMultiplier: [30,432],
  buyBonusRandomMatrixIndex_0: {
    weights: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
  },
  buyBonusRandomMatrixIndex_1: {
    weights: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94]
  },

  reelsSet: {
    spin_Prob: [100],
    spin_Set: [0],
    freespins_0_Prob: [40],
    freespins_0_Set: [0],
  },

  paytable: {
    S: { 3: 1, 4: 2, 5: 8 },
    H1: { 3: 0.8, 4: 3, 5: 5 },
    H2: { 3: 0.8, 4: 2, 5: 4 },
    H3: { 3: 0.8, 4: 1.6, 5: 3 },

    M1: { 3: 0.4, 4: 1, 5: 2 },
    M2: { 3: 0.4, 4: 1, 5: 2 },

    L1: { 3: 0.2, 4: 0.6, 5: 1 },
    L2: { 3: 0.2, 4: 0.6, 5: 1 },
    L3: { 3: 0.2, 4: 0.6, 5: 1 },
  },

  features: {

    FREEGAME_WILD_REEL_MULTIPLIER_REEL_1: {
      weights: [5, 11, 4, 2, 1, 1],
      values: [1, 2, 3, 5, 7, 10],
    },
    FREEGAME_WILD_REEL_MULTIPLIER_REEL_2: {
      weights: [7, 10, 3, 2, 1, 1],
      values: [5, 7, 10, 15, 20, 25],
    },

    FREEGAME_WILD_REEL_MULTIPLIER_WEIGHT: [60, 1],

    FREEGAME_WILD_REEL_MULTIPLIER_VALUE: ['REEL_1', 'REEL_2'],

    spin: {
      scatters: {
        symbol: 'S',
        trigger: TRIGGER.FREESPINS,
        freespin_count: 7,
        symbol_length: 3,

        triggers: [
          {
            found: 3,
            count: 7,
          },
          {
            found: 4,
            count: 7,
          },
          {
            found: 5,
            count: 7,
          },
        ],
      },
      wild: {
        symbol: 'W',
        EXTRA_FREEGAME_COUNT: 2,

        WILD_number_weights_reel_1: [5, 1], // weights for wild symbols for nudging
        WILD_number_value_reel_1: [false, true],

        WILD_number_weights_reel_2: [5, 1], // weights for wild symbols for nudging
        WILD_number_value_reel_2: [false, true],

        WILD_number_weights_reel_3: [4, 1], // weights for wild symbols for nudging
        WILD_number_value_reel_3: [false, true],

      },
    },

  },

  freespins: {
    choice: [
      { count: 7, multiplier: 1 },
      { count: 7, multiplier: 1 },
    ],
  },

}
