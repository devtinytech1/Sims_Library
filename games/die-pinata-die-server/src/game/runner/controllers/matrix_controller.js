
const baseSequences = require('../../../../../die-pinata-die-server/src/game/runner/configs/sequences.js')
const baseSettings = require('../../../../../die-pinata-die-server/src/game/runner/configs/settings')
const random = require('../../../../../die-pinata-die-server/src/game/runner/math/random_controller')

async function make(client, mode, rows) {
  if (baseSequences.get(client.gameId)['default_basegame_position'] && !client.node.state) {
    return baseSequences.get(client.gameId)['default_basegame_position'];
  }
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

//find Jackpot symbol consecutively
function foundSymbolsforJ(matrix, symbol) {
  let positionsOfJ = [];
  for (let i = 0; i < matrix.length; i++) {
    let row = matrix[i];
    let positionsInRow = [];
    if (row.includes(symbol)) {
      // Iterate through the row to find positions of 'J' symbols
      for (let j = 0; j < row.length; j++) {
        if (row[j] === symbol) {
          positionsInRow.push([i, j]);
        }
      }
      // positionsOfJ = positionsOfJ.concat(positionsInRow);
      positionsOfJ.push(...positionsInRow);
    } else {
      break;
    }
  }

  return positionsOfJ;
}

module.exports = { make, copy, swapSymbols, foundSymbols, foundSymbolsforJ }