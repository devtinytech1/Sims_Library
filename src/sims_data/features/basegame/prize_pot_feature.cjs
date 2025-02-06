const { round } = require('../../../../src/utils/math.cjs');
const baseSettings = require('../../../../games/die-pinata-die-server/src/game/runner/configs/settings');
const matrixController = require('../../../../games/die-pinata-die-server/src/game/runner/controllers/matrix_controller');

function init(client) {
  const settings = baseSettings.get(client.gameId).features.prizePot,
    features = client.getFeatures()
  features.prizePot = {
    mask: [],
    count: 0,
    threshold: [...settings.threshold],
    maxCount: settings.threshold[settings.threshold.length - 1].count,
    level: 0,
    win: 0,
  }
  client.getprizePot = () => features.prizePot
  return { accumulation, check }
}

function accumulation(client, checkReelsCount = 6) {
  const settings = baseSettings.get(client.gameId).features.prizePot,
    pp = client.getprizePot(),
    matrix = client.matrix.reduce((acc, reel, reelId) => {
      acc.push(client.matrix.length - checkReelsCount <= reelId ? reel : [])
      return acc
    }, [])
  pp.mask = matrixController.foundSymbolsforJ(matrix, settings.symbol)
  pp.count += pp.mask.length
  if (pp.count > pp.maxCount) {
    pp.count = pp.maxCount
  }
  pp.level = pp.threshold.reduce((value, data, id) => data.count <= pp.count ? id : value, 0)
}

function check(client) {
  const pp = client.getprizePot()
  pp.win = round(pp.threshold.reduce((value, data) =>
    data.count <= pp.count ? data.value : value, 0) * client.spinBet)
  client.getFeatures().total = round(client.getFeatures().total + pp.win)
}

module.exports = { check, accumulation, init }
