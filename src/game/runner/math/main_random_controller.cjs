
const rng = require('../../../rng/index.cjs')

function getBatchItems(sequence, count, batch) {
  return [...sequence, ...sequence.slice(0, count)].splice(getBatchIndexEqualWeights(batch, sequence), count)
}

async function getRandomItems(client, sequence, count) {
  const pos = await getRandomInt(client, sequence.length)
  return pos > sequence.length ?
    Promise.reject('items value range') :
    [...sequence, ...sequence.slice(0, count)].splice(pos, count)
}

function getBatchResultEqualWeights(value, values) {
  return values[getBatchIndexEqualWeights(value, values)]
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

module.exports = {
  getRandomItemByArrayWeights,
  getRandomItems,
  getRandomInt,
  getWeightResultIndex,
  getBatchItems,
  getBatchResultEqualWeights,
}
