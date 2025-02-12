const fetch = require('node-fetch')

async function execute(data, config) {
  const { endpoint, body, queryParams, aHeaders } = data
  const { host, cHeaders, endpoints } = config
  const { path, method } = endpoints[endpoint]
  const headers = Object.assign(cHeaders, aHeaders)
  const url = `${host}${path}?` + new URLSearchParams(queryParams)
  const request = { method, headers, body }
  try {
    const response = await fetch(url, request)
    const out = await response.json()
    return out
  }
  catch (e) {
    const response = e
    return Promise.reject(response)
  }
}

module.exports = { execute }
