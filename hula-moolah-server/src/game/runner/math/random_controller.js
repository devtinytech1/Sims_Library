const rng = require('../../../rng')

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

async function getRandomItem(client, sequence, options) {
  const value = await getRandomInt(client, sequence.length)
  if (value > sequence.length) {
    return Promise.reject('items value range')
  }
 
  options.result = []
  options.result.push(sequence[value])
  return options
}

async function getRandomInt(client, maxValue) {
  const val = await rng.random({ sessionId: client.sessionId, bound: maxValue })
  return val <= maxValue ?
    val :
    Promise.reject(`int value range val:${val} max:${maxValue}`)
}

function getWeightResultIndex(arr, value) {
  let w = 0
  for (let i = 0; i < arr.length; i++) {
    w += arr[i]
    if (w > value) {
      return i
    }
  }
  return 0
}

async function getRandomItemByArrayWeights(client, weights, values) {
  if (weights == null || values == null || !weights.length || !values.length || weights.length !== values.length) {
    return Promise.reject('weights.length !== values.length')
  }
  const sum = weights.reduce((acc, val) => acc + val)
  const value = await getRandomInt(client, sum)
  return value <= sum ?
    values[getWeightResultIndex(weights, value)] :
    Promise.reject('weights: value range')
}

module.exports = { getRandomItemByArrayWeights, getRandomItems, getRandomItem, getRandomInt }
