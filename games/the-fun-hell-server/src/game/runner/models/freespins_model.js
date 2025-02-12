
const baseSettings = require('../configs/settings')
const { TRIGGER } = require('../../../../../../src/game/runner/configs/static.cjs')

function copy(client) {
  const prev = client.prevContext.freespins,
    model = client.context.freespins = {
      all: prev.all,
      add: 0,
      left: prev.left,
      total: prev.total,
    }
  client.getFreespins = () => model
  return model
}

function init(client) {
  const count = baseSettings.get(client.gameId).features.freespins.initCount,
    model = client.context.freespins = {
      all: count || 0,
      add: count || 0,
      left: count || 0,
      total: 0,
    }
  client.getFreespins = () => model
  client.nextTrigger = TRIGGER.FREESPINS
}

function addCount(client, count) {
  const model = client.getFreespins()
  model.all += count
  model.add += count
  model.left += count
  client.nextTrigger = TRIGGER.FREESPINS
}

module.exports = { init, copy, addCount }
