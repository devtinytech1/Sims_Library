const transport = require('../../../../src/tools/transport/index.cjs')
const { endpoints, name } = require('../../../../src/rng/config.cjs')
const rnd = require('../../../../src/rng/dev.cjs')

const { MODE } = process.env

async function random(data) {
  const { sessionId, bound } = data
  if (MODE === 'dev') {
    return rnd(bound)
  }
  else {
    const endpoint = endpoints.random
    const aHeaders = { 'X-SESSION-ID': sessionId }
    const queryParams = { bound }
    const params = { name, endpoint, queryParams, aHeaders }
    const response = await transport.send(params)
    const { value } = response
    return value < bound
      ? value
      : Promise.reject('rng out of bound')
  }
}

async function batch(data) {
  const { sessionId, bound, batchSize } = data
  if (MODE === 'dev') {
    return Array.from({ length: batchSize }, () => rnd(bound, sessionId))
  }
  const endpoint = endpoints.batch
  const aHeaders = { 'X-SESSION-ID': sessionId }
  const queryParams = { bound, batchSize }
  const params = { name, endpoint, queryParams, aHeaders }
  const response = await transport.send(params)
  return response.data
}

module.exports = { random, batch }
