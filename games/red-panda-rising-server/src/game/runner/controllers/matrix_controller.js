
const baseSequences = require('../configs/sequences')
const baseSettings = require('../configs/settings')
const randomController = require('../math/random_controller')
// const random = require('../math/random_controller')

/* async function make(client, mode, rows) {
  const reelsSet = baseSettings.get(client.gameId).reelsSet,
    matrix = [],
    batch = await random.getBatch(client, baseSettings.base.cols + 1),
    option = random.getBatchResult(batch.shift(), reelsSet[`${mode}Prob`], reelsSet[`${mode}Set`]),
    sequences = baseSequences.get(client.gameId)[reelsSet.sequenceMap[mode]][option]
  async function getReel(ix) {
    matrix.push(await random.getBatchItems(sequences[ix], rows, batch.shift()))
    ix !== sequences.length - 1 && await getReel(ix + 1)
  }
  await getReel(0)
  return matrix
}*/

async function make(client, spinMod, rows = 3) {
  const settings = baseSettings.get(client.gameId)
  if (settings.reelsSet[spinMod + '_Prob']) {
    const option = await randomController.getRandomItemByArrayWeights(client, settings.reelsSet[spinMod + '_Prob'],
      settings.reelsSet[spinMod + '_Set'])
    const result = [],
      sequences = baseSequences.get(client.gameId)[spinMod][option]
    const getReel = async function (ix) {
      const body = await randomController.getRandomItems(client, sequences[ix], { count: rows, ix })
      result.push(body.result)
      return ix === sequences.length - 1 ? result : await getReel(ix + 1)
    }
    return await getReel(0)
  }
  else {
    return Promise.reject(`spin mode: ${spinMod}`)
  }
}

function copy(client) {
  client.matrix = client.prevContext.matrix.map(reel => [...reel])
}

function swapSymbols(matrix, target, symbol) {
  return matrix.reduce((acc, reel) => {
    acc.push(reel.reduce((newReel, sym) => {
      newReel.push(sym === target ? symbol : sym)
      return newReel
    }, []))
    return acc
  }, [])
}

function foundSymbols(matrix, symbol) {
  return matrix.reduce((acc, reel, col) => {
    reel.forEach((sym, row) => sym === symbol && acc.push([col, row]))
    return acc
  }, [])
}

module.exports = { make, copy, swapSymbols, foundSymbols }
