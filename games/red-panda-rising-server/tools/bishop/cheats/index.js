/* eslint-disable no-console */
const path = require('path')

require('dotenv').config()
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const settings = require('../../../../../src/game/runner/bishop/settings/bishopSettings.cjs')
const call = require('./controllers/call')
const baseCallBody = require('./models/baseCallBody')
const context = require('./models/context')

const maxIterations = process.env.BISHOP_ITERATIONS || settings.iterationsCount

const pickSettings = {
  bonus_pick: process.env.BONUS_PICK ? process.env.BONUS_PICK.split(',').map(str => parseInt(str)) : [0],
  collection_selection: process.env.COLLECTION_SELECTION ? process.env.COLLECTION_SELECTION.split(',').map(str => parseInt(str)) : [0],
  boosters_selection: process.env.BOOSTERS_SELECTION ? process.env.BOOSTERS_SELECTION.split(',').map(str => parseInt(str)) : [0],
  bonus_pick_selection: process.env.BONUS_PICK_SELECTION ? process.env.BONUS_PICK_SELECTION.split(',').map(str => parseInt(str)) : [0],
  mode_selection: process.env.MODE_SELECTION ? process.env.MODE_SELECTION.split(',').map(str => parseInt(str)) : [0],
  choice: process.env.CHOICE ? process.env.CHOICE.split(',').map(str => parseInt(str)) : [0],
}

const pickCurrent = {}

function getPick(key) {
  if (pickCurrent[key] && pickCurrent[key].length) {
    return pickCurrent[key].shift()
  }
  pickCurrent[key] = [...pickSettings[key]]
  return getPick(key)
}

function cError(message) {
  console.error(message)
}

function getBaseTriggerFunc(withCheck = false) {
  return async function (trigger, ix) {
    await localCall(trigger, ix)
    if (withCheck) {

    }
    return context.call.trigger
  }
}

async function localCall(trigger, ix) {
  context.prevTrigger = context.currentTrigger
  context.currentTrigger = trigger
  const act = settings.actions && settings.actions[context.currentTrigger] ? settings.actions[context.currentTrigger] : trigger
  await call(ix == null ? baseCallBody(act) : baseCallBody(act, ix))
}

const selectionFunc = getBaseTriggerFunc(true)

const triggers = {
  init: async function () {
    await call({ action: settings.keys?.init || 'init' },
      { settingsKey: settings.settingsKey || 'settings94', bets: [1], goldenBets: [settings.goldenBet || 1] })
    return context.call.trigger
  },
  spin: async function (trigger) {
    if (context.iteration >= maxIterations || context.cheatsCheckedDone) {
      return 'doneAction'
    }
    await localCall(trigger)
    if (context.call.error) {
      return console.error(context.call.error)
    }
    if (context.currentTrigger === 'spin') {
      context.iteration++

    }
    if (context.iteration % 100000 === 0) {
      console.clear()
      console.log(`iterations: ${context.iteration}`)
    }
    return context.call.trigger
  },
  bonus: getBaseTriggerFunc(true),
  choice_pick: async trigger => await selectionFunc(trigger, 0),
  choice: async trigger => await selectionFunc(trigger, getPick('choice')),
  freespins: getBaseTriggerFunc(true),
  freespins_end: getBaseTriggerFunc(true),
  bonus_end: getBaseTriggerFunc(true),
  respin: getBaseTriggerFunc(true),
  cascade: getBaseTriggerFunc(true),
  destroy: getBaseTriggerFunc(true),
  doneAction: async function () {
    console.log(`done! iterations: ${context.iteration}`)
  },
  accumulation_respin: getBaseTriggerFunc(true),
  accumulation_megarespin: getBaseTriggerFunc(true),
  bonus_pick_selection: async trigger => await selectionFunc(trigger, getPick('bonus_pick_selection')),
  bonus_pick: async trigger => await selectionFunc(trigger, getPick('bonus_pick')),
  collection_selection: async trigger => await selectionFunc(trigger, getPick('collection_selection')),
  boosters_selection: async trigger => await selectionFunc(trigger, getPick('boosters_selection')),
  mode_selection: async trigger => await selectionFunc(trigger, getPick('mode_selection')),
  repeat: getBaseTriggerFunc(true),
  collect: getBaseTriggerFunc(true),
}

function nextTrigger(trigger) {
  // eslint-disable-next-line no-unused-expressions
  triggers[trigger] ? triggers[trigger](trigger).then(nextTrigger, cError) : cError(`trigger:${trigger}`)
}

function start() {
  // triggers.doneAction = doneAction(callback)
  triggers.init().then(nextTrigger, cError)
}

start()
