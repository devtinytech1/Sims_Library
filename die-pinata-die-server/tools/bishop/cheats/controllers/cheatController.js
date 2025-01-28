const cheatSettings = require('../../../../src/game/runner/bishop/settings/cheatSettings')
const cheatPool = require('../../../../src/rng/pool')
const context = require('../models/context')
const { CHEATS } = require('../models/static')

const infoOn = process.env.CHEATS_INFO === 'true'

// eslint-disable-next-line import/order
const fs = require('fs'),
  reservedHookKeysPool = ['name', 'history', 'limit', 'type', 'value'],
  stats = [],
  historyPool = {
    pool: [],
    info: [],
  }

let pool, hooksPool = []
if (!cheatSettings || !cheatSettings.pool || !cheatSettings.pool.length) {
  // eslint-disable-next-line no-console
  console.error('!cheatSettings || !cheatSettings.pool || !cheatSettings.pool.length')
}
else {
  hooksPool = cheatSettings.pool
    .reduce((res, hookSettings) => {
      if (hookSettings.proto) {
        const proto = cheatSettings.proto[hookSettings.proto]
        hookSettings.values.forEach(value => res.push(parseProto(proto, hookSettings.keys, value)))
      }
      else {
        res.push(hookSettings)
      }
      return res
    }, [])
}

function getInfoData(data) {
  if (cheatSettings.info) {
    Object.entries(cheatSettings.info).forEach(([key, pathStr]) => {
      const path = pathStr.split('.')
      let content = context[path.shift()]
      while (path.length && content) {
        content = content[path.shift()]
      }
      content != null && (data[key] = content)
    })
  }
  return data
}

function setHistoryItem() {
  historyPool.info.push(getInfoData({ pool: [...pool] }))
  historyPool.pool.push(...pool)
}

function clearStore() {
  cheatPool.clear()
  if (context.call.trigger === 'spin') {
    historyPool.pool = []
    historyPool.info = []
  }
}

function parseProto(proto, keys, values) {
  if (typeof proto === 'string') {
    const found = Array.isArray(keys) ? keys.map(key => `{${key}}`) : [`{${keys}}`]
    const past = Array.isArray(values) ? values : [values]
    return found.reduce((res, key, ix) =>
      typeof res === 'string' && res.includes(key) ? res === key ? past[ix] : res.replace(`${key}`, past[ix]) : res,
    proto)
  }
  else if (typeof proto === 'object') {
    if (Array.isArray(proto)) {
      return proto.reduce((arr, value) => {
        arr.push(parseProto(value, keys, values))
        return arr
      }, [])
    }
    else {
      return Object.keys(proto).reduce((obj, key) => {
        obj[key] = parseProto(proto[key], keys, values)
        return obj
      }, {})
    }
  }
  else {
    return proto
  }
}

function check() {
  pool = cheatPool.get()
  setHistoryItem()
  let isCheck = false
  hooksPool.forEach((hook, i) => {
    const limit = hook.limit || cheatSettings.limit || 1
    if (!hook.count || hook.count < limit) {
      isCheck = true
      if (checkHook(hook)) {
        hook.count || (hook.count = 0)
        hook.count++
        stats.push(Object.assign(
          { name: hook.name || i, pool: hook.history ? [...historyPool.pool] : pool },
          infoOn ?
            hook.history ?
              { context: context.call, info: [...historyPool.info] } :
              { context: context.call } :
            {},
        ))
      }
    }
  })
  clearStore()
  isCheck || (context.cheatsCheckedDone = true)
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
      case CHEATS.TYPE_EQUAL:
        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            if (value[i] === content) {
              return true
            }
          }
          return false
        }
        return value === content
      case CHEATS.TYPE_NOT_EQUAL:
        return value !== content
      case CHEATS.TYPE_MORE:
        return value < content
      case CHEATS.TYPE_LESS:
        return value > content
      case CHEATS.TYPE_LENGTH:
        return value === content.length
      case CHEATS.TYPE_OBJ_LENGTH:
        return value === Object.keys(content).length
      case CHEATS.TYPE_INCLUDES:
        return Array.isArray(value) ?
          value.reduce((acc, val) => acc && content.includes(val), true) :
          content.includes(value)
      case CHEATS.TYPE_EXISTS:
        return content[value] != null
      case CHEATS.TYPE_ABSENT:
        return content[value] == null
      case CHEATS.TYPE_RECURSIVE:
        if (!value.length) {
          return true
        }
        if (!content.length) {
          return false
        }
        for (let i = 0; i < content.length; i++) {
          const valuesRes = []
          for (let h = 0; h < value.length; h++) {
            valuesRes.push(value[h].path ?
              checkPath(value[h].path, content[i], value[h]) :
              cheatSettings.parse(context.call, value[h], content[i]))
          }
          if (!valuesRes.includes(false)) {
            return true
          }
        }
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
        { currentTrigger: context.currentTrigger, prevTrigger: context.prevTrigger }), hook)) {
        return false
      }
    }
    else if (!cheatSettings.parse(context, hook)) {
      return false
    }
  }
  return true
}

function save() {
  // eslint-disable-next-line no-unused-expressions
  stats.length && fs.writeFileSync(`./out/cheats_${process.env.GAME}_${Date.now()}.json`,
    // eslint-disable-next-line no-console
    JSON.stringify({
      game: process.env.GAME,
      stats,
      // eslint-disable-next-line no-console
    }), err => err ? console.log(err) : '')
}

module.exports = {
  check,
  save,
}
