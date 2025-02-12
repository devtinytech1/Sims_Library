const { TRIGGER } = require('./static')

module.exports = {
  name: '96',
  buyBonusMultiplier: [45],
  buyBonusRandomMatrixIndex_0: {
    weights: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99]
  },

  reelsSet: {
    MainBoardProb: [8, 3, 3, 1],
    MainBoardSet: [0, 1, 2, 3],
    modeMainBoardProb: [10, 100, 10],
    modeMainBoardSet: [0, 1, 3],
    spinBonusBoardProb: [10, 100, 10],
    spinBonusBoardSet: [0, 1, 2],
    sequenceMap: {
      MainBoard: 'MainBoard',
      modeMainBoard: 'MainBoard',
      spinBonusBoard: 'BonusBoard',
    },
  },

  WI: ['W1', 'W2', 'W3'],
  paytable: {
    H1: { 3: 4 },
    H1x2: { 3: 8 },
    H1x3: { 3: 12 },
    H1x5: { 3: 20 },

    M1: { 3: 2.4 },
    M2: { 3: 1 },
    M3: { 3: 0.75 },

    L1: { 3: 0.3 },
    MX: { 3: 0.5 },
  },

  features: {
    spin: {
      scatters: {
        symbol: 'B',
        symbol_length: 1,
      },
    },

    wheel: {
      triggerCount: 1,
      triggerSymbol: 'B',

      top_wheel_weights: [20, 16, 7, 14, 4, 20, 10, 2],
      top_wheel_values: [[2, true], [5, false], [12, true], [7, false], [15, false], [4, true], [9, false], [18, false]],

      middle_wheel_weights: [15, 8, 20, 7, 9, 12, 20, 1],
      middle_wheel_values: [[27, true], [40, false], [24, false], [45, false], [35, true], [30, false], [20, false], [50, false]],
      
      bottom_wheel_weights: [1, 8, 20, 5, 15, 12, 20, 9],
      bottom_wheel_values: [[5000,false], [300, false], [100, false], [500, false], [150, false], [200, false], [125, false], [250, false]],
    },
  },
}
