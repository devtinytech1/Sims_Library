
const { TRIGGER } = require('../../configs/static')
const { foundSymbols } = require('../../math/found_symbols')
const freespinsModel = require('../../../../../tools/simulations/freespinsModel')
const { getWildReelMultiplier } = require('../features/wild_reel_multiplier_feature')
const baseSequences = require('../../configs/sequences')

async function scatterFeatureCheck(client, matrix, settings) {

  const scatter = settings.scatters.symbol
  const wild = settings.wild.symbol
  client.matrix = matrix
  const expandingWildPos = client.getFeatures().expandingWildPosition
  const mask = foundSymbols(matrix, [scatter, wild])

  // get no of bonus/wild involve in bonus trigger

  if (mask.length >= settings.scatters.symbol_length) {
    client.getFeatures().isScatter = true

    const [extraCount, carryForwardExpandingWildSymbol] = countAdditionalFreespin(mask, expandingWildPos, settings)

    const freegameCount = settings.scatters.freespin_count + extraCount
    client.nextTrigger = TRIGGER.FREESPINS

    setFreespinModel(client, freegameCount, carryForwardExpandingWildSymbol, mask)
    await setReelMultiplier(client)

  }
}

//set reel multiplier for freespins
async function setReelMultiplier(client) {
  const reelMultiplier = await getWildReelMultiplier(client)
  client.getFreespins().reelMultiplier = reelMultiplier
}

// count additional freegames when expanding wild involve in bonus trigger
function countAdditionalFreespin(mask, expandingWildPosition, settings) {
  let count = 0
  let positionHolder = []

  const addFreegameCount = settings.wild.EXTRA_FREEGAME_COUNT
  if (expandingWildPosition.length > 0) {
    for (let i = 0; i < expandingWildPosition.length; i++) {
      for (let j = 0; j < mask.length; j++) {
        if (expandingWildPosition[i][0] === mask[j][0]) {
          count += addFreegameCount
          positionHolder.push(expandingWildPosition[i])
          break
        }
      }
    }
  }
  return [count, positionHolder]
}

// set free spin Model
function setFreespinModel(client, freespinCount, carryForwardExpandingWildSymbol, scatterMask) {
  let pick = 0
  const default_freespins_position = baseSequences.get(client.gameId)['default_freespins_position'];
  freespinsModel.init(client, pick)
  client.getFreespins().scatterWin = client.getFeatures().scatterWin
  client.getFreespins().all = freespinCount
  client.getFreespins().add = freespinCount
  client.getFreespins().left = freespinCount
  client.getFreespins().expandingWildPos = carryForwardExpandingWildSymbol
  client.getFreespins().scatters = scatterMask
  client.getFreespins().fs_matrix = default_freespins_position
  client.getFreespins().basegameWin = { matrix: client.node.context.matrix, win: client.node.context.win, expandingWildPosition: carryForwardExpandingWildSymbol }
}

module.exports = { scatterFeatureCheck }
