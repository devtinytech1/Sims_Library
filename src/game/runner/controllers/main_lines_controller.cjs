const { round } = require('../../../../src/utils/math.cjs')

function getLineModel(lineId, win, position, symbolId, trigger, len, count) {
  return {
    id: lineId,
    win: win,
    len: len,
    count: count,
    trigger: trigger,
    mask: position,
    symbol: symbolId,
    multi: 1,
  }
}

function makeWinModel(client, currentContext) {
  currentContext.win = {
    type: 'regular',
    lines: [],
    total: 0,
  }
  client.getWinModel = () => currentContext.win
  return currentContext.win
}

function setLineMulti(winModel, line, multi) {
  winModel.total -= line.win
  line.win /= line.multi
  line.multi *= multi
  line.win = round(line.win * line.multi)
  winModel.total = round(winModel.total + line.win)
}


module.exports = { getLineModel, makeWinModel, setLineMulti }