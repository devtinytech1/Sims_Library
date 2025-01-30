
const base = {
  call: {},
  currentTrigger: 'init',
  iteration: 0,
}

const context = {}

function reset() {
  Object.keys(base).forEach(key => context[key] = base[key])
}

reset()

module.exports = context
