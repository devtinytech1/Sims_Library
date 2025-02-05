
const { TRIGGER } = require('../../game/runner/configs/static.cjs')

function cascadeFeatureCheck(client) {
  if (client.node.context.win?.lines.length) {
    let destroyArray = [];
    for (let i = 0; i < client.node.context.win.lines.length; i++) {
      let destroyMask = client.node.context.win.lines[i].mask;
      destroyArray = destroyArray.concat(destroyMask);
    }
    //To remove the duplicate element from the whole array of matched symbols and converted into set
    const updatedDestroyArraySet = new Set(destroyArray.map(JSON.stringify));
    // To convert that set in  array format
    const updatedDestroyArray = Array.from(updatedDestroyArraySet, JSON.parse);
    client.node.context.destroy = updatedDestroyArray
    client.nextTrigger = TRIGGER.CASCADE
  }
}

module.exports = { cascadeFeatureCheck }
