
const listeners = []
const base = {
  now: Date.now(),
  bishopID: '',

  outputFields: [],

  states: {},
  call: {},
  win: 0,
  currentTrigger: 'init',
  reset,
  addResetListener: listener => listeners.push(listener),
}

const context = {}

function reset() {
  Object.keys(base).forEach(key => context[key] = base[key])
  listeners.forEach(listener => listener())
}

reset()

module.exports = context
