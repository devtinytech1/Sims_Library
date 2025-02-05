const { TRIGGER } = require("../../../../../../src/game/runner/configs/static.cjs");

module.exports = {
  name: '96',
  buyBonusBetMultiplier: [80],

  reelsSet: {
    spin_Prob: [100],
    spin_Set: [0],

    buy_bonus_Prob: [100],
    buy_bonus_Set: [0],

    freespins_Prob: [100],
    freespins_Set: [0],

    basegame_cascade_cascade_Prob: [100],
    basegame_cascade_cascade_Set: [0],

    freegames_cascade_cascade_Prob: [100],
    freegames_cascade_cascade_Set: [0],
  },

  WI: 'W',
  paytable: {
    "J": {
      5: 0.2, 6: 0.24, 7: 0.32, 8: 0.4, 9: 0.48, 10: 0.64, 11: 0.72, 12: 0.8, 13: 1.3, 14: 1.3, 15: 1.3, 16: 1.3, 17: 1.3, 18: 1.3, 19: 1.3, 20: 1.3,
      21: 1.3, 22: 1.3, 23: 1.3, 24: 1.3, 25: 1.3, 26: 1.3, 27: 1.3, 28: 1.3, 29: 1.3, 30: 1.3, 31: 1.3, 32: 1.3, 33: 1.3, 34: 1.3, 35: 1.3, 36: 1.3
    },

    'Q': {
      5: 0.2, 6: 0.24, 7: 0.32, 8: 0.4, 9: 0.48, 10: 0.64, 11: 0.72, 12: 0.8, 13: 1.3, 14: 1.3, 15: 1.3, 16: 1.3, 17: 1.3, 18: 1.3, 19: 1.3, 20: 1.3,
      21: 1.3, 22: 1.3, 23: 1.3, 24: 1.3, 25: 1.3, 26: 1.3, 27: 1.3, 28: 1.3, 29: 1.3, 30: 1.3, 31: 1.3, 32: 1.3, 33: 1.3, 34: 1.3, 35: 1.3, 36: 1.3
    },

    'K': {
      5: 0.2, 6: 0.24, 7: 0.32, 8: 0.4, 9: 0.48, 10: 0.64, 11: 0.72, 12: 0.8, 13: 1.3, 14: 1.3, 15: 1.3, 16: 1.3, 17: 1.3, 18: 1.3, 19: 1.3, 20: 1.3,
      21: 1.3, 22: 1.3, 23: 1.3, 24: 1.3, 25: 1.3, 26: 1.3, 27: 1.3, 28: 1.3, 29: 1.3, 30: 1.3, 31: 1.3, 32: 1.3, 33: 1.3, 34: 1.3, 35: 1.3, 36: 1.3
    },

    'A': {
      5: 0.2, 6: 0.24, 7: 0.32, 8: 0.4, 9: 0.48, 10: 0.64, 11: 0.72, 12: 0.8, 13: 1.3, 14: 1.3, 15: 1.3, 16: 1.3, 17: 1.3, 18: 1.3, 19: 1.3, 20: 1.3,
      21: 1.3, 22: 1.3, 23: 1.3, 24: 1.3, 25: 1.3, 26: 1.3, 27: 1.3, 28: 1.3, 29: 1.3, 30: 1.3, 31: 1.3, 32: 1.3, 33: 1.3, 34: 1.3, 35: 1.3, 36: 1.3
    },

    'M1': {
      5: 0.4, 6: 0.48, 7: 0.56, 8: 0.64, 9: 0.72, 10: 0.8, 11: 1.0, 12: 1.2, 13: 1.8, 14: 1.8, 15: 1.8, 16: 1.8, 17: 1.8, 18: 1.8, 19: 1.8, 20: 1.8,
      21: 1.8, 22: 1.8, 23: 1.8, 24: 1.8, 25: 1.8, 26: 1.8, 27: 1.8, 28: 1.8, 29: 1.8, 30: 1.8, 31: 1.8, 32: 1.8, 33: 1.8, 34: 1.8, 35: 1.8, 36: 1.8
    },

    'M2': {
      5: 0.4, 6: 0.48, 7: 0.56, 8: 0.64, 9: 0.72, 10: 0.8, 11: 1.0, 12: 1.2, 13: 1.8, 14: 1.8, 15: 1.8, 16: 1.8, 17: 1.8, 18: 1.8, 19: 1.8, 20: 1.8,
      21: 1.8, 22: 1.8, 23: 1.8, 24: 1.8, 25: 1.8, 26: 1.8, 27: 1.8, 28: 1.8, 29: 1.8, 30: 1.8, 31: 1.8, 32: 1.8, 33: 1.8, 34: 1.8, 35: 1.8, 36: 1.8
    },

    'H1': {
      5: 0.8, 6: 0.88, 7: 0.96, 8: 1.04, 9: 1.12, 10: 1.2, 11: 1.28, 12: 1.4, 13: 2.4, 14: 2.4, 15: 2.4, 16: 2.4, 17: 2.4, 18: 2.4, 19: 2.4, 20: 2.4,
      21: 2.4, 22: 2.4, 23: 2.4, 24: 2.4, 25: 2.4, 26: 2.4, 27: 2.4, 28: 2.4, 29: 2.4, 30: 2.4, 31: 2.4, 32: 2.4, 33: 2.4, 34: 2.4, 35: 2.4, 36: 2.4
    },
    'H2': {
      5: 0.88, 6: 0.96, 7: 1.04, 8: 1.12, 9: 1.2, 10: 1.28, 11: 1.4, 12: 1.6, 13: 3, 14: 3, 15: 3, 16: 3, 17: 3, 18: 3, 19: 3, 20: 3,
      21: 3, 22: 3, 23: 3, 24: 3, 25: 3, 26: 3, 27: 3, 28: 3, 29: 3, 30: 3, 31: 3, 32: 3, 33: 3, 34: 3, 35: 3, 36: 3
    },
    'H3': {
      5: 0.96, 6: 1.04, 7: 1.12, 8: 1.2, 9: 1.28, 10: 1.4, 11: 1.6, 12: 2.0, 13: 4.0, 14: 4.0, 15: 4.0, 16: 4.0, 17: 4.0, 18: 4.0, 19: 4.0, 20: 4.0,
      21: 4.0, 22: 4.0, 23: 4.0, 24: 4.0, 25: 4.0, 26: 4.0, 27: 4.0, 28: 4.0, 29: 4.0, 30: 4.0, 31: 4.0, 32: 4.0, 33: 4.0, 34: 4.0, 35: 4.0, 36: 4.0
    },
    'H4': {
      5: 1.04, 6: 1.12, 7: 1.2, 8: 1.28, 9: 1.4, 10: 1.6, 11: 2.0, 12: 2.4, 13: 4.8, 14: 4.8, 15: 4.8, 16: 4.8, 17: 4.8, 18: 4.8, 19: 4.8, 20: 4.8,
      21: 4.8, 22: 4.8, 23: 4.8, 24: 4.8, 25: 4.8, 26: 4.8, 27: 4.8, 28: 4.8, 29: 4.8, 30: 4.8, 31: 4.8, 32: 4.8, 33: 4.8, 34: 4.8, 35: 4.8, 36: 4.8
    },
    'W': {
      5: 1.04, 6: 1.12, 7: 1.2, 8: 2.0, 9: 2.0, 10: 2.0, 11: 2.0, 12: 2.0, 13: 2.0, 14: 2.0, 15: 2.0, 16: 2.0, 17: 2.0, 18: 2.0, 19: 2.0, 20: 2.0,
      21: 2.0, 22: 2.0, 23: 2.0, 24: 2.0, 25: 2.0, 26: 2.0, 27: 2.0, 28: 2.0, 29: 2.0, 30: 2.0, 31: 2.0, 32: 2.0, 33: 2.0, 34: 2.0, 35: 2.0, 36: 2.0
    },
  },
  features: {
    multiplier_upgrade: 2,
    spin: {
      scatters: {
        symbol: 'S',
        trigger: TRIGGER.FREESPINS,
        triggers: [
          {
            found: 3,
            count: 10,
          },
          {
            found: 4,
            count: 12,
          },
          {
            found: 5,
            count: 15,
          },
          {
            found: 6,
            count: 20,
          },
        ],
      }
    },

    reveal_symbol_Prob: [136, 122, 111, 102],
    reveal_symbol_Set: ['H1', 'H2', 'H3', 'H4'],

    //flip_probability for unused  wild in basegame and cascade
    flip_probability: [75, 25],
    flip_set: [true, false],

    // probability of adding scatters at a spin
    scatter_prob: [49, 951],
    scatter_set: [true, false],

    // how many scatters to add. We place them on random reels, random spots 
    scatters_number_prob: [4000, 2600, 80, 12, 4, 1],
    scatters_number_set: [1, 2, 3, 4, 5, 6],

    // probability of adding Wilds at a spin
    wild_prob: [15, 85],
    wild_set: [true, false],

    // how many wilds to add. We place them on random reels, random spots 
    wilds_number_prob: [16, 12, 8, 4, 2, 1],
    wilds_number_set: [1, 2, 3, 4, 5, 6],

    // probability of adding scatters at a basegame_cascade
    cascade_scatter_prob: [1475, 8525],
    cascade_scatter_set: [true, false],

    //how many scatters to add at a basegame_cascade . We place them on random reels, random spots
    cascade_scatters_number_prob: [94, 220, 36, 28, 16, 12],
    cascade_scatters_number_set: [1, 2, 3, 4, 5, 6],

    //probability of adding Wilds at a basgame_cascade
    cascade_wild_prob: [571, 429],
    cascade_wild_set: [true, false],

    // how many wilds to add at a  basgame_cascade . We place them on random reels, random spots 
    cascade_wilds_number_prob: [24, 16, 9, 4, 2, 1],
    cascade_wilds_number_set: [1, 2, 3, 4, 5, 6],

    //flip_probability for unused wild in Freespin and free spin cascade
    FS_flip_probability: [100],
    FS_flip_set: [true],

    fs_reveal_symbol_Prob: [1300, 1200, 1127, 1060],
    fs_reveal_symbol_Set: ['H1', 'H2', 'H3', 'H4'],

    //probability of adding wilds in freespin
    FS_wild_prob: [501, 499],
    FS_wild_set: [true, false],

    // how many wilds to add at FreeSpin . We place them on random reels, random spots 
    FS_wilds_number_prob: [26, 22, 16, 6, 3, 1],
    FS_wilds_number_set: [1, 2, 3, 4, 5, 6],

    //probability of adding Wilds at a Freespin_cascade
    FS_cascade_wild_prob: [549, 451],
    FS_cascade_wild_set: [true, false],

    // how many wilds to add at a  FreeSpin_cascade . We place them on random reels, random spots 
    FS_cascade_wilds_number_prob: [20, 16, 12, 5, 2, 1],
    FS_cascade_wilds_number_set: [1, 2, 3, 4, 5, 6],

    //buy a bonus
    buy_bonus_scatter_prob: [100],
    buy_bonus_scatter_set: [true],

    //how many scatters to add in buy a bonus. We place them on random reels, random spots 
    buy_bonus_scatters_number_prob: [1435, 700, 500, 400],
    buy_bonus_scatters_number_set: [3, 4, 5, 6],
  }
}
