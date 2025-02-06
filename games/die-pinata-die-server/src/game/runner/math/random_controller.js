
const rng = require('../../../../../../src/rng/index.cjs')
const batchValue = require('../../../../../../src/game/runner/configs/settings.cjs').base.batchValue

function getBatchItems(sequence, count, batch) {
  return [...sequence, ...sequence.slice(0, count)].splice(getBatchIndexEqualWeights(batch, sequence), count)
}

async function getBatch(client, batchSize) {
  return await rng.batch({ sessionId: client.sessionId, bound: batchValue, batchSize })
}

function getBatchIndexEqualWeights(value, values) {
  return Math.floor(value * values.length / batchValue) + 1
}

function getBatchResult(value, weights, values) {
  const sum = weights.reduce((acc, val) => acc + val)
  const nValue = value * sum / batchValue
  return values[getWeightResultIndex(weights, nValue)]
}

function getWeightResultIndex(weights, value) {
  let w = 0
  for (let i = 0; i < weights.length; i++) {
    w += weights[i]
    if (w > value) {
      return i
    }
  }
  return 0
}

module.exports = {
  getBatch,
  getBatchResult,
  getWeightResultIndex,
  getBatchItems,
}
