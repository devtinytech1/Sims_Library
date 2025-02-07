
const listeners = []
const base = {
  now: Date.now(),
  bishopID: '',

  call: {},
  win: 0,
  currentTrigger: 'init',

  // rtpMap: {
  //   it: [],
  //   bg: [],
  //   ftr: [],
  //   bns: [],
  //   fs: [],
  //   gm: [],
  // },
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
