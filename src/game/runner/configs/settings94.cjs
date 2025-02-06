const { TRIGGER } = require("./static.cjs");

module.exports = {
  name: '96',
  buyBonusBetMultiplier: 1,
  buyBonusMultiplier: [68, 102, 4],

  reelsSet: {
    basegameProb: [100],
    basegameSet: [0],

    basegame_respinProb: [100],
    basegame_respinSet: [0],

    freespins_0Prob: [100],
    freespins_0Set: [0],

    freespins_respinProb: [100],
    freespins_respinSet: [0],

    sequenceMap: {
      basegame: 'basegame',
      basegame_respin: 'basegame_respin',
      freespins_0: 'freespins_0',
      freespins_respin: 'freespins_respin',
    },
  },

  WI: 'W',

  paytable: {
    W: { 6: 10 },
    H1: { 3: 0.5, 4: 1, 5: 1.5, 6: 2 },
    H2: { 3: 0.5, 4: 1, 5: 1.5, 6: 2 },
    M1: { 3: 0.2, 4: 0.4, 5: 0.8, 6: 1.4 },
    M2: { 3: 0.2, 4: 0.4, 5: 0.8, 6: 1.4 },
    L1: { 3: 0.1, 4: 0.2, 5: 0.4, 6: 0.8 },
    L2: { 3: 0.1, 4: 0.2, 5: 0.4, 6: 0.8 },
    L3: { 3: 0.1, 4: 0.2, 5: 0.4, 6: 0.8 },
    L4: { 3: 0.1, 4: 0.2, 5: 0.4, 6: 0.8 },
  },

  features: {
    //Basegame DiceRoll
    diceRoll: {
      diceRollProb: [20, 80],
      diceRollOutcome: [true, false],

      featureProb: [2, 1, 3],
      featureOutcome: ['Wild', 'Bonus', 'ReSpin'],

      Bonus: {
        convertToBonusProb: [1, 1, 1, 1, 1, 1],
        convertToBonusOutcome: ['H1', 'H2', 'M1', 'M2', 'L1', 'L2']
      },

      Wild: {
        convertToWildProb: [1, 1, 1, 1, 1, 1],
        convertToWildOutcome: ['H1', 'H2', 'M1', 'M2', 'L1', 'L2']
      },

      ReSpin: {
        respinProb: [1, 1, 1, 1, 1, 1],
        respinOutcome: ['H1', 'H2', 'M1', 'M2', 'L1', 'L2']
      }
    },

    //Freespin trigger
    spin: {
      scatters: {
        triggerSymbol: 'B',
        minTriggerCount: 5,
        trigger: TRIGGER.FREESPINS,
      },
    },

    //Freespin DiceRoll
    fs_diceRoll: {
      fs_diceRollProb: [35, 65],
      fs_diceRollOutcome: [true, false],

      fs_featureProb: [3, 1, 2],
      fs_featureOutcome: ['fs_Wild', 'fs_Bonus', 'fs_ReSpin'],

      fs_Bonus: {
        fs_convertToBonusProb: [2, 1, 1, 1, 1],
        fs_convertToBonusOutcome: ['H1', 'H2', 'M1', 'M2', 'L1']
      },

      fs_Wild: {
        fs_convertToWildProb: [2, 1, 1, 1, 1],
        fs_convertToWildOutcome: ['H1', 'H2', 'M1', 'M2', 'L1']
      },

      fs_ReSpin: {
        fs_RespinProb: [2, 1, 1, 1, 1],
        fs_RespinOutcome: ['H1', 'H2', 'M1', 'M2', 'L1']
      }
    },

    prizePot: {
      symbol: 'J',
      threshold: [
        { count: 3, value: 10, type: 'mini', },
        { count: 4, value: 50, type: 'minor', },
        { count: 5, value: 200, type: 'major', },
        { count: 6, value: 2000, type: 'grand', },
      ],
    },
  }
}

