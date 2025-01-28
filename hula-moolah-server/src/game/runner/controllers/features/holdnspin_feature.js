const { initHoldnspin } = require('../actions/action_holdnspin_node')
const { getRandomItemByArrayWeights } = require('../../math/random_controller');

const HNS_PROB = 'HNS_prob';
const HNS_SET = 'HNS_set';
const FS_HNS_PROB = 'FS_HNS_prob';
const FS_HNS_SET = 'FS_HNS_set';

async function holdnspinFeatureCheck(client, settings, state, trigger, triggerWin) {
  let isHoldnspinTriggered = false;

  if (client.node.state === 'spin') {
    // Buy bonus condition..
    if(client.request.params.index === 0){
      isHoldnspinTriggered = true
    } else {
      isHoldnspinTriggered = await getRandomItemByArrayWeights(client, settings[HNS_PROB], settings[HNS_SET]);
    }
  } else if (client.node.state === 'freespins') {
    isHoldnspinTriggered = await getRandomItemByArrayWeights(client, settings[FS_HNS_PROB], settings[FS_HNS_SET]);
  }

  if (isHoldnspinTriggered) {
    client.node.currentGameMetaMorphicLevel = 4
    //trigger hold n spin feature
    let maxOfBetAndTriggeringWin = triggerWin > client.spinBet ? triggerWin : client.spinBet
    await initHoldnspin(client, settings, state, trigger, maxOfBetAndTriggeringWin)
    isHoldnspinTriggered = true
  }
  return isHoldnspinTriggered
}

module.exports = { holdnspinFeatureCheck }
