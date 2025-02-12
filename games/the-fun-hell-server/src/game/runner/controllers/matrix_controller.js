
const baseSequences = require('../configs/sequences')
const baseSettings = require('../configs/settings')
const random = require('../math/random_controller')

async function make(client, spinMod, rows) {
  if(baseSequences.get(client.gameId)['default_basegame_position'] && client.node.state == undefined)
  {
    return baseSequences.get(client.gameId)['default_basegame_position'];
  }

  const settings = baseSettings.get(client.gameId)
  if (settings.reelsSet[`${spinMod}Prob`]) {
    const option = await random.getRandomItemByArrayWeights(client, settings.reelsSet[`${spinMod}Prob`],
      settings.reelsSet[`${spinMod}Set`])
    const result = [],
      sequences = baseSequences.get(client.gameId)[spinMod][option]
    const getReel = async function (ix) {
      const body = await random.getRandomItems(client, sequences[ix], { count: rows, ix })
      result.push(body.result)
      return ix === sequences.length - 1 ? result : await getReel(ix + 1)
    }
    return await getReel(0)
  }
  else {
    return Promise.reject(`spin mode: ${spinMod}`)
  }
}

// async function make(client, mode, rows) {
//   if (baseSequences.get(client.gameId)['default_basegame_position'] && !client.node.state) {
//     return baseSequences.get(client.gameId)['default_basegame_position'];
//   }
//   const reelsSet = baseSettings.get(client.gameId).reelsSet,
//     matrix = [],
//     batch = await random.getBatch(client, baseSettings.base.cols + 1),
//     option = random.getBatchResult(batch.shift(), reelsSet[`${mode}Prob`], reelsSet[`${mode}Set`]),
//     sequences = baseSequences.get(client.gameId)[reelsSet.sequenceMap[mode]][option]
//   async function getReel(ix) {
//     matrix.push(await random.getBatchItems(sequences[ix], rows, batch.shift()))
//     ix !== sequences.length - 1 && await getReel(ix + 1)
//   }
//   await getReel(0)
//   return matrix
// }

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
