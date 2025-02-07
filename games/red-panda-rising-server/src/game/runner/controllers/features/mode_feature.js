const baseSettings = require('../../configs/settings')
const matrix = require('../matrix_controller')

function getModel(client, add, mask) {
  if (client.getMode) {
    const currentMode = client.getMode()
    currentMode.add = add
    currentMode.all += add
    currentMode.left += add
    currentMode.mask = mask
  }
  else {
    client.getFeatures().mode = {
      total: 0,
      add,
      all: add,
      left: add,
      mask,
      isInitial: true,
    }
    client.getMode = () => client.getFeatures().mode
  }
}
function check(client) {
  const settings = baseSettings.get(client.gameId).features.mode
  const triggersMask = matrix.foundSymbols(client.matrix, settings.triggerSymbol)
  triggersMask.length >= settings.triggerCount && getModel(client, settings.addingCount, triggersMask)
}

function copy(client) {
  const data = client.prevContext.features.mode
  if (data && data.left) {
    client.getFeatures().mode = {
      total: data.total,
      add: 0,
      all: data.all,
      left: data.left,
      mask: [],
    }
    client.getMode = () => client.getFeatures().mode
  }
  return this
}

function decrease(client) {
  client.getMode && client.getMode().left--
}

module.exports = { check, copy, decrease }
