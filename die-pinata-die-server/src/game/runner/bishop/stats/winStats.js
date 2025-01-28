
const { TRIGGER } = require('../../configs/static')
const debug = require('../controllers/debug')
const deviation = require('../controllers/deviation')
const context = require('../models/context')
const mathUtils = require('../utils/math')
const maxWin = require('./maxWin')
const symbolsStats = require('./symbolsStats')

function getModel() {
  return {
    rtp: 0,
    win: 0,
    symbolsSum: 0,
    symbols: {},
  }
}

function check(statsBase, model) {
  var isWinAdded = false
  if (context.call.context.features.diceRoll && context.call.trigger !== TRIGGER.RESPIN) {
    isWinAdded = true
    context.win = ((context.call.context.features.diceRoll.before.total || 0) + (context.call.context.features.diceRoll.after.total || 0) + context.call.context.features.total );
    if (context.win) {
      statsBase.win += context.win;
      context.getMainStats().totalPayOut += context.win;
      const mergedLines = (context.call.context.features.diceRoll.before.lines || []).concat(context.call.context.features.diceRoll.after.lines || []);
      symbolsStats.check(mergedLines, [statsBase.symbols]);
    }

    if(context.call.context.features.diceRoll.featureTriggered == 'W')
    {
      model.G +=  context.call.context.features.diceRoll.before.total
      model.G_Wild +=  context.call.context.features.diceRoll.after.total
    }
    if(context.call.context.features.diceRoll.featureTriggered == 'B')
    {
      model.G +=  context.call.context.features.diceRoll.before.total
      model.G_Bonus +=  context.call.context.features.diceRoll.after.total
    }

  }else if (context.call.context.features.fs_diceRoll && context.call.trigger !== TRIGGER.RESPIN) {
    isWinAdded = true
    context.win = (context.call.context.features.fs_diceRoll.before.total || 0) + (context.call.context.features.fs_diceRoll.after.total || 0);
    if (context.win) {
      statsBase.win += context.win;
      context.getMainStats().totalPayOut += context.win;
      const mergedLines = (context.call.context.features.fs_diceRoll.before.lines || []).concat(context.call.context.features.fs_diceRoll.after.lines || []);
      symbolsStats.check(mergedLines, [statsBase.symbols]);
    }
    if(context.call.context.features.fs_diceRoll.featureTriggered == 'W')
    {
      model.G += context.call.context.features.fs_diceRoll.before.total
      model.G_Wild += context.call.context.features.fs_diceRoll.after.total
    }
    if(context.call.context.features.fs_diceRoll.featureTriggered == 'B')
    {
      model.G += context.call.context.features.fs_diceRoll.before.total
      model.G_Bonus += context.call.context.features.fs_diceRoll.after.total
    } 
  }else if ((context.call.context.win && context.call.context.win.total) || context.call.context.features.total) {
    if(!isWinAdded)
    {
      context.win = context.call.context.win.total + (context.call.context.features.total || 0);
      if (context.win) {
        statsBase.win += context.win;
        context.getMainStats().totalPayOut += context.win;
        symbolsStats.check(context.call.context.win.lines, [statsBase.symbols]);
      }
      if(context.call.context.win.total && context.currentTrigger != TRIGGER.RESPIN &&!context.call.context.features.total)
      {
        model.G += context.call.context.win.total
      }
      if(context.call.context.win.total && context.currentTrigger == TRIGGER.RESPIN &&!context.call.context.features.total)
      {
        model.G_Respin += context.call.context.win.total
      }
    }
  }
 
  deviation.save();
  debug.save();
  maxWin.check();
}

function update(statsBase, spinCount) {
  statsBase.symbols && symbolsStats.update(statsBase.symbols, spinCount)
  statsBase.rtp = mathUtils.getRTP(statsBase.win)
}

module.exports = { getModel, check, update }
