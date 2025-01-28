const rng = require('../rng')

async function regular(sessionId, options) {
  const { pool, weight, index } = options
  let bound = 0
  const limits = weight.map(x => bound += x)
  const random = await rng.random({ sessionId, bound })
  const idx = limits.findIndex(limit => random < limit)
  const position = index[idx]
  return pool[position]
}

async function leveled(sessionId, options, progress) {
  const { pool, levels } = options
  const step = Math.min(levels.length - 1, progress)
  const { weight, index } = levels[step]
  return await regular(sessionId, { pool, weight, index })
}

module.exports = { regular, leveled }
