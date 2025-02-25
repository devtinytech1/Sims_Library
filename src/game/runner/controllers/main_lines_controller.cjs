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
  

module.exports = { getLineModel, makeWinModel }