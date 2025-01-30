const { RNG_URL } = process.env

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
}

module.exports = {
  host: RNG_URL,
  cHeaders: headers,
  endpoints: {
    random: {
      method: 'GET',
      path: '/random',
    },
    batch: {
      method: 'GET',
      path: '/random/batch',
    },
  },
}
