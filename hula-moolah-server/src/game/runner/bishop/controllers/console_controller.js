/* eslint-disable no-console */
const context = require('../models/context')

const map = [
  { title: 'iteration', path: 'stats.iteration' },
  { title: 'Pay Win', type: 'line' },

  { title: 'totalBet', path: 'stats.totalBet' },
  { title: 'totalPayOut', path: 'stats.totalPayOut' },

  { title: 'Global', type: 'line' },

  { title: 'gameRTP[94.417]', path: 'stats.rtp' },
  { title: 'MaxRoundTotalWin', path: 'stats.MaxRoundTotalWin' },
]

function clearOutput() {
  // eslint-disable-next-line no-console
  console.clear()
}

function updateOutput() {
  map.forEach(inst => {
    if (inst.add && inst.add.includes('before')) {
      console.log('')
    }
    if (inst.path) {
      const path = inst.path.split('.')
      let val = context[path.shift()]
      path.forEach(way => val = val[way])
      console.log(inst.title + ' : ' + (typeof val === 'object' && Array.isArray(val) ? JSON.stringify(val) : val))
    }
    else if (inst.type === 'line') {
      console.log(`---${inst.title}---------------`)
    }
    if (inst.add && inst.add.includes('after')) {
      console.log('')
    }
  })
}

module.exports = {
  clearOutput: process.env.AUTO_SEQUENCES !== 'true' ? clearOutput : () => {},
  updateOutput: process.env.AUTO_SEQUENCES !== 'true' ? updateOutput : () => {},
}
