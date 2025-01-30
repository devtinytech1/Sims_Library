let pool = []

function get() {
  return pool
}

function clear() {
  pool = []
}

module.exports = { pool, get, clear }
