
const baseSettings = require('../../../../red-panda-rising-server/src/game/runner/configs/settings')
const random = require('../../../../red-panda-rising-server/src/game/runner/math/random_controller')
const matrix = require('../../../../red-panda-rising-server/src/game/runner/controllers/matrix_controller')

function getModel(client) {
  const model = client.getFeatures().randomWild = {
    originalMatrix: [],
    additionalMatrix: [],
    triggers: [],
    mask: [],
  }
  client.getRandomWild = () => model
  return model
}
async function check(client) {
  const settings = baseSettings.get(client.gameId).features.randomWild

  const model = getModel(client)
  model.originalMatrix.push(...client.matrix.map(reel => reel.map(el => el)))

  if (client.getMode) {
    model.additionalMatrix.push(...client.getAdditionalBoard().matrix.map(reel => reel.map(el => el)))
    model.triggers = matrix.foundSymbols(model.additionalMatrix, settings.triggerSymbol)
    if (model.triggers.length) {
      model.triggers.forEach(mask => mask[0] += model.originalMatrix.length)
      const w = [],
        pos = [],
        wildsCount = settings.wildsCount[model.triggers.length - 1]

      fillWeights(model.originalMatrix, w, pos, settings)
      fillWeights(model.additionalMatrix, w, pos, settings, model.originalMatrix.length)

      if (pos.length > wildsCount) {
        const batch = await random.getBatch(client, wildsCount)
        batch.forEach(val => {
          const mask = random.getBatchResult(val, w, pos)
          setWild(model, mask)
          random.spliceItemWV(w, pos, pos.indexOf(mask))
        })
      }
      else {
        pos.forEach(mask => setWild(model, mask))
      }
    }
  }
}

function fillWeights(matrix, weights, mask, settings, offset = 0) {
  matrix.forEach((reel, col) => reel.forEach((sym, row) => {
    if (!settings.excludeSymbols.includes(sym)) {
      weights.push(settings.reelsWeights[col + offset])
      mask.push([col + offset, row])
    }
  }))
}

function setWild(model, mask) {
  mask[0] >= model.originalMatrix.length ?
    (model.additionalMatrix[mask[0] - model.originalMatrix.length][mask[1]] = baseSettings.base.WI) :
    (model.originalMatrix[mask[0]][mask[1]] = baseSettings.base.WI)

  model.mask.push(mask)
}

module.exports = { check }
