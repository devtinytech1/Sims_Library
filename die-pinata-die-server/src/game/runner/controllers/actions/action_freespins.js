const baseSettings = require('../../configs/settings')
const { KEY, TRIGGER } = require('../../configs/static')
const features = require('../features/features')
const foundMatrix = require('../matrix_controller')
const matrix = require('../matrix_controller')
const roundWin = require('../round_win_controller')
const baseSequences = require('../../configs/sequences')
const { round } = require('../../../../utils/math')

// To set the initial freespins model.
function setFreespinsModel(currentContext, allCount, addCount, leftCount, default_freespins_position, fs_triggering_matrix) {
  currentContext.freespins = {
    all: allCount || 0,
    add: addCount || 0,
    left: leftCount || 0,
    total: 0,
    scatters: [],
    ind : 0,
    fs_matrix: default_freespins_position || [],
    fs_triggering_matrix: JSON.parse(JSON.stringify(fs_triggering_matrix)),
  }
}
// To copy the freespins model from the last context.
function freespinsModelCopy(currentContext, lastContext) {
  if (lastContext.freespins) {
    currentContext.freespins = {}
    for (const key in lastContext.freespins) {
      currentContext.freespins[key] = lastContext.freespins[key]
    }
    currentContext.freespins.scatters = []
  }
}

//To add freespins count to the current context.
function addFreespinsCount(currentContext, add) {
  if (currentContext.freespins) {
    currentContext.freespins.all += add
    currentContext.freespins.add += add
    currentContext.freespins.left += add
  }
}

// To check for scatter symbols in the free spins feature.
function scatterFS(client, matrix, settings) {
  const scatterSymbol = settings.scatters.triggerSymbol;
  const mask = foundMatrix.foundSymbols(matrix, scatterSymbol);
  const minScatterSymbols = settings.scatters.minTriggerCount;
  if(mask.length >= minScatterSymbols){
    addFreespinsCount(client.context, mask.length)
  }
}

//To initialize freespins feature with the number of freespins triggered.
function initFreespins(client, fs_triggering_matrix, mask) {
  const add = mask.length
  const default_freespins_position = baseSequences.get(client.gameId)['default_freespins_position'];
  setFreespinsModel(client.context, add, add, add, default_freespins_position, fs_triggering_matrix) 
  client.context.freespins.scatters = mask
}

//Starting point of the action freespins
async function execute(client) {
  if (client.prevTrigger !== TRIGGER.FREESPINS) {
    return Promise.reject(KEY.INVALID_ACTION)
  }

  if(client.prevTrigger === TRIGGER.FREESPINS) {
    if (client.prevContext.freespins.left < 1) {
      return Promise.reject(KEY.INVALID_LEFT_COUNT)
    }
  }
 
  client.nextState = TRIGGER.FREESPINS
  client.nextTrigger = TRIGGER.FREESPINS
  features.init(client)
  features.prizePot.init(client)
  
  const settings = baseSettings.get(client.gameId);
  client.matrix = await matrix.make(client, `${TRIGGER.FREESPINS}_${client.prevContext.freespins.ind}`,baseSettings.base.fsrows)
 
  freespinsModelCopy(client.context, client.prevContext)
  client.context.freespins.left-- 
  client.context.freespins.add = 0

  const beforeDiceMatrix = client.matrix.map(row => [...row]);
  // Check diceRoll triggered or not
  const diceRoll = await features.fs_diceRoll.checkDiceRoll(client);
  if(diceRoll){
      // Before Dice Feature winning
      roundWin.check(client)
      // Check diceOutcome(Bonus, Wild or Rsepin)
      await features.fs_diceRoll.checkDiceRollFeature(client);
      client.context.features.fs_diceRoll.afterDiceMatrix = client.matrix
      client.context.features.fs_diceRoll.diceTriggered = true
      //Give the Response to the client for Before & After Dice Feature winning
      const winData = client.node.context.features.fs_diceRoll;
      if(winData.bonusPositions || winData.wildPositions) {
        winData.before = client.context.win
        roundWin.check(client);
        winData.after = client.context.win
        winData.bonusPositions && scatterFS(client, client.matrix, settings.features.spin)
      }
   }else{
      roundWin.check(client)
   }
  if (client.context.freespins.left < 1 && client.nextTrigger != TRIGGER.RESPIN) {
    client.nextTrigger = TRIGGER.FREESPINS_END
  }

  //MaxwinCap
  if(client.node.spinTotal >= round(client.winCap * client.betMultiplier))
  {
    if( client.node.context.freespins.total >= round(client.winCap * client.betMultiplier))
    {
      client.node.context.freespins.total = round(client.winCap * client.betMultiplier)
    }
    if(client.node.context.win.total >= round(client.winCap * client.betMultiplier))
    {
      client.node.context.win.total = round(client.winCap * client.betMultiplier)
    }
    client.node.context.freespins.left = 0
    client.node.trigger = TRIGGER.FREESPINS_END
  }

  client.matrix = beforeDiceMatrix
}

module.exports = { execute, initFreespins }