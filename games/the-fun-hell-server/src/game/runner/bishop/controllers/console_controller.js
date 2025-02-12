/* eslint-disable no-console */
const context = require('../models/context')

const map = [
  { title: 'iteration', path: 'main.iteration' },
  { title: 'Pay Win', type: 'line' },

  { title: 'totalBet', path: 'main.totalBet' },
  { title: 'totalPayOut', path: 'main.totalPayOut' },

  { title: 'Global', type: 'line' },

  { title: 'gameRTP', path: 'main.rtp' },
  { title: 'spinRTP', path: 'main.bgRTP' },
  { title: 'MaxRoundTotalWin', path: 'main.MaxRoundTotalWin' },
  { title: 'maxWheelBonusWin', path: 'main.maxWheelBonusWin' },

  { title: 'Wheel Bonus Win', type: 'line' },
  { title: 'Wheel Bonus', path: 'main.wheelBonusRTP' },
  { title: 'Wheel 1 RTP', type: 'line' },
  { title: 'Wheel 1 RTP', path: 'main.wheel1RTP' },
  { title: 'Wheel 2 RTP', type: 'line' },
  { title: 'Wheel 2 RTP', path: 'main.wheel2RTP' },
  { title: 'Wheel 3 RTP', type: 'line' },
  { title: 'Wheel 3 RTP', path: 'main.wheel3RTP' },

  { title: 'Sym Win', type: 'line' },
  { title: 'symRTP', path: 'spins.base.symbols' },
]

function clear() {
  // eslint-disable-next-line no-console
  console.clear()
  return this
}

function update() {
  map.forEach(inst => {
    if (inst.add && inst.add.includes('before')) {
      console.log('')
    }
    if (inst.path) {
      const path = inst.path.split('.')
      let val = context[path.shift()]
      try {
        path.forEach(way => val = val[way])
      }
      catch (e) {}
      console.log(inst.title + ' : ' + (typeof val === 'object' && Array.isArray(val) ? JSON.stringify(val) : JSON.stringify(val)))
    }
    else if (inst.type === 'line') {
      console.log(`%c---${inst.title}---------------`, `color:${inst.color};`)
    }
    if (inst.add && inst.add.includes('after')) {
      console.log('')
    }
  })
}

module.exports = {
  clear,
  update,
}
