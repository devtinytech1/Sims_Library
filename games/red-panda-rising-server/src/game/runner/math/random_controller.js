
const rng = require('../../../../../../src/rng/index.cjs')
const batchValue = require('../configs/settings').base.batchValue

function getBatchItems(sequence, count, batch) {
  return [...sequence, ...sequence.slice(0, count)].splice(getBatchIndexEqualWeights(batch, sequence), count)
}

/*
async function getRandomItems(client, sequence, count) {
  const pos = await getRandomInt(client, sequence.length)
  return pos > sequence.length ?
    Promise.reject('items value range') :
    [...sequence, ...sequence.slice(0, count)].splice(pos, count)
}
*/

async function getRandomItems(client, sequence, options) {
  const sequenceNew = sequence.map(el => el)
  for (let i = 0; i < options.count; i++) {
    sequenceNew.push(sequence[i])
  }
  const value = await getRandomInt(client, sequence.length)
  if (value > sequence.length) {
    return Promise.reject('items value range')
  }
  if (options.count === 1) {
    return sequenceNew[value]
  }
  options.result = []
  for (let i = 0; i < options.count; i++) {
    options.result.push(sequenceNew[i + value])
  }
  return options
}

async function getBatch(client, batchSize) {
  return await rng.batch({ sessionId: client.sessionId, bound: batchValue, batchSize })
}

function getBatchIndexEqualWeights(value, values) {
  return Math.floor(value * values.length / batchValue) + 1
}

function getBatchResultEqualWeights(value, values) {
  return values[getBatchIndexEqualWeights(value, values)]
}

function getBatchResult(value, weights, values) {
  const sum = weights.reduce((acc, val) => acc + val)
  const nValue = value * sum / batchValue
  return values[getWeightResultIndex(weights, nValue)]
}

async function getRandomInt(client, bound) {
  if (process.env.MODE === 'dev') {
    return await rng.random({ bound })
  }
  else {
    const val = await rng.random({ sessionId: client.sessionId, bound })
    return val <= bound ? val : Promise.reject(`int value range val:${val} max:${bound}`)
  }
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

async function getRandomItemByArrayWeights(client, weights, values) {
  if (!weights || !values || weights.length !== values.length) {
    return Promise.reject('weights.length !== values.length')
  }
  let sum = 0
  try {
    sum = weights.reduce((acc, val) => acc + val)
  }
  catch (e) {
    sum = 0
  }
  const value = await getRandomInt(client, sum)
  return value <= sum ? values[getWeightResultIndex(weights, value)] : Promise.reject('weights: value range')
}

function spliceItemWV(weights, values, ix) {
  weights.splice(ix, 1)
  values.splice(ix, 1)
}

module.exports = {
  getRandomItemByArrayWeights,
  getRandomItems,
  getRandomInt,
  spliceItemWV,
  getBatch,
  getBatchResult,
  getWeightResultIndex,
  getBatchItems,
  getBatchResultEqualWeights,
}
