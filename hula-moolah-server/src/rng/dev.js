const { pool } = require('./pool')

function rnd(bound) {
  const random = Math.floor(Math.random() * bound)
  if (process.env.BISHOP_CHIT_ON === 'true') {
    pool.push(random)
  }
  return random
}

module.exports = rnd
