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

module.exports = { getLineModel }