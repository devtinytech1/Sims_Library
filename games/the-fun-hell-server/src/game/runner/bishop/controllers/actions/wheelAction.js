
const baseCallBody = require('../../models/baseCallBody')
const context = require('../../models/context')
const winStats = require('../../stats/winStats')
const call = require('../call')
const hfStats = require('../../stats/hfStats')
const deviation = require('../deviation')
const maxWin = require('../../stats/maxWin')
const mainStats = require('../../stats/mainStats')
const mathUtils = require('../../../../../../../../src/utils/math.cjs')
const { TRIGGER } = require('../../../configs/static')

let model
const name = 'wheel'
const reset = () => {
  context[name] = Object.assign({
      win: 0,
      wheelRtp: 0,
      avgPay: 0,
    },
    {
      base: Object.assign(winStats.getModel()),
    })
  context.outputFields.includes(name) || context.outputFields.push(name)
  model = context[name]
  context.getWheel = () => model
}
context.addResetListener(reset)
reset()

module.exports = async function wheelAction() {
  const mainStatsModel = context.getMainStats()
  await call(baseCallBody())
  if (context.call.context.features.total) {
    mainStatsModel.wheelBonusWin += context.call.context.features.total
    if (context.call.context.features.total > mainStatsModel.maxWheelBonusWin) {
      mainStatsModel.maxWheelBonusWin = context.call.context.features.total
    }
    for (let item of context.call.context.features.wheel.wheel) {
      if (item.level === 1) {
        mainStatsModel.wheel1Win += item.total
      } else if (item.level === 2) {
        mainStatsModel.wheel2Win += item.total
      } else if (item.level === 3) {
        mainStatsModel.wheel3Win += item.total
      }
    }
  }
  winStats.check(model.base, model)
  mainStats.update()
}


