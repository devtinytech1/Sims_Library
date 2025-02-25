const mathUtils = require('../../../../../../src/utils/math.cjs')
const baseSettings = require('../../../../../die-pinata-die-server/src/game/runner/configs/settings')
const { getLineModel, makeWinModel } = require('../../../../../../src/game/runner/controllers/main_lines_controller.cjs')

wilds = baseSettings.base.wilds,
  scatters = baseSettings.base.scatters,
  itsWildSymbol = id => wilds.includes(id),
  itsScatterSymbol = id => scatters.includes(id)

function checkWays(client, matrix) {
  const settings = baseSettings.get(client.gameId),
    symbols = matrix.reduce((acc, reel) => {
      acc.push(reel.reduce((ac, sym) => {
        itsScatterSymbol(sym) || (ac[sym] = ac[sym] ? ac[sym] + 1 : 1)
        return ac
      }, {}))
      return acc
    }, []),
    winModel = makeWinModel(client, client.context)

  const reduceAllWildsWays = function (waysLength) {
    col = 0;
    wildCount = 1;
    while (col < waysLength) {
      wildCount = wildCount * (symbols[col][settings.WI] ? symbols[col][settings.WI] : 0)
      col++
    }
    return wildCount
  }

  const setLinesWin = function (symbol, length, count) {
    if (settings.paytable[symbol] && settings.paytable[symbol][length]) {
      const win = mathUtils.round(count * settings.paytable[symbol][length] * client.spinBet)
      winModel.total = mathUtils.round(winModel.total + win)
      const mask = []
      for (let col = 0; col < length; col++) {
        matrix[col].forEach((sym, ix) => (sym === symbol || itsWildSymbol(sym)) && mask.push([col, ix]))
      }
      winModel.lines.push(getLineModel(undefined, win, mask, symbol, null, length, count))
      symbols.forEach(reel => reel[symbol] && delete reel[symbol])
    }
  }
  const nextWay = function (symbol, symbols, col, lineSymbol, value) {
    const wildsCount = symbols[col][settings.WI] || 0
    if (itsWildSymbol(lineSymbol)) {
      Object.entries(symbols[col]).forEach(([sym, count]) => itsWildSymbol(sym) || (col + 1 < symbols.length ?
        nextWay(sym, symbols, col + 1, sym, value * (count + wildsCount)) :
        setLinesWin(sym, symbols.length, ((value * (count + wildsCount)) - reduceAllWildsWays(symbols.length)))))

      wildsCount && (col + 1 < symbols.length ?
        nextWay(settings.WI, symbols, col + 1, settings.WI, value * wildsCount) :
        setLinesWin(settings.WI, symbols.length, value * wildsCount))
    }
    else {
      const symbolCount = symbols[col][symbol]
      if (symbolCount || wildsCount) {
        const cnt = symbolCount && wildsCount ? symbolCount + wildsCount : symbolCount ? symbolCount : wildsCount
        col < symbols.length - 1 ?
          nextWay(symbol, symbols, col + 1, symbol, value * cnt) :
          setLinesWin(symbol, symbols.length, ((value * cnt) - reduceAllWildsWays(symbols.length)))
      }
      else {
        setLinesWin(symbol, col, value - reduceAllWildsWays(col))
      }
    }
  }
  const wildsStartCount = symbols[0][settings.WI] || 0
  Object.entries(symbols[0]).forEach(([sym, count]) =>
    itsWildSymbol(sym) || nextWay(sym, symbols, 1, sym, count + wildsStartCount))

  wildsStartCount && nextWay(settings.WI, symbols, 1, settings.WI, wildsStartCount)
}

module.exports = { checkWays, makeWinModel }