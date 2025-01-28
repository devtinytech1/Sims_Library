
const { get, clear } = require('../../../../rng/pool')
const context = require('../models/context')
const bishopSettings = require('../settings/bishopSettings')
const cheatSettings = require('../settings/cheatSettings')

// eslint-disable-next-line import/order
const fs = require('fs'),
  reservedHookKeysPool = ['name', 'history', 'limit'],
  stats = [],
  historyPool = { pool: [], info: [] },
  checkCheats = process.env.BISHOP_CHIT_ON === 'true' && cheatSettings && cheatSettings.pool && cheatSettings.pool.length ?
    checkHooks :
    () => { }

let pool

function setHistoryItem() {
  historyPool.info.push({
    pool: [...pool],
    currentTrigger: context.currentTrigger,
    nextTrigger: context.call.trigger,
    state: context.call.state,
    win: context.call.context.win ? context.call.context.win.total : 0 || 0,
    jp: context.call.context?.jackpot?.win || 0,
  })
  historyPool.pool.push(...pool)
}

function clearStore() {
  clear()
  if (context.call.trigger === bishopSettings.keys.spin) {
    historyPool.pool = []
    historyPool.info = []
  }
}

function checkHooks() {
  pool = get()
  setHistoryItem()
  cheatSettings.pool.forEach((hook, i) => {
    const limit = hook.limit || cheatSettings.limit || 1
    if (!hook.count || hook.count < limit) {
      if (checkHook(hook)) {
        if (!hook.count) {
          hook.count = 0
        }
        hook.count++
        stats.push({
          name: hook.name || i,
          pool: hook.history ? [...historyPool.pool] : pool,
          info: hook.history ? [...historyPool.info] : [],
        })
      }
    }
  })
  clearStore()
}

function checkPath(pth, data, hook) {
  let path, value
  if (Array.isArray(pth)) {
    path = pth[0].split('.')
    if (pth.length > 1) {
      const val = pth[1].split('.')
      value = data[val.shift()]
      while (val.length && value) {
        value = value[val.shift()]
      }
    }
  }
  else {
    path = pth.split('.')
    value = hook.value
  }
  let content = data[path.shift()]
  while (path.length && content) {
    content = content[path.shift()]
  }
  if (content != null) {
    switch (hook.type) {
      case '===':
        return value === content
      case '>':
        return value < content
      case '<':
        return value > content
      case 'length':
        return value === content.length
      case 'includes':
        return content.includes(value)
      case 'recursive':
        for (let i = 0; i < content.length; i++) {
          for (let h = 0; h < value.length; h++) {
            if (!checkPath(value[h].path, content[i], value[h])) {
              return false
            }
          }
        }
        return !value.length || content.length
    }
  }
  return false
}

function checkHook(hook) {
  const keys = Object.keys(hook).filter(key => !reservedHookKeysPool.includes(key))
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] === 'pool') {
      for (let i = 0; i < hook.pool.length; i++) {
        if (!checkHook(hook.pool[i])) {
          return false
        }
      }
    }
    else if (keys[i] === 'path') {
      if (!checkPath(hook.path, Object.assign(context.call,
        { currentTrigger: context.currentTrigger }), hook)) {
        return false
      }
    }
    else if (!cheatSettings.parse(context.call, hook, keys[i])) {
      return false
    }
  }
  return true
}

function saveCheatStats() {
  // eslint-disable-next-line no-unused-expressions
  stats.length && fs.writeFileSync(`./out/cheats_${Date.now()}.json`,
    // eslint-disable-next-line no-console
    JSON.stringify({ stats }), err => err ? console.log(err) : '')
}

module.exports = { checkCheats, saveCheatStats }
