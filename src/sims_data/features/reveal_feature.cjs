
const { TRIGGER } = require('../../game/runner/configs/static.cjs')

function symbolRevealFeatureCheck(client) {
    if (client.node.context.win?.lines.length) {
        //KK Commented on July 14 
        client.nextTrigger = TRIGGER.CASCADE
        let destroyArray = [];
        for (let i = 0; i < client.node.context.win.lines.length; i++) {
            let tempmask = client.node.context.win.lines[i].mask;
            destroyArray = destroyArray.concat(tempmask);
        }
        //To remove the duplicate element from the whole array of matched symbols and converted into set
        const updatedDestroyArraySet = new Set(destroyArray.map(JSON.stringify));
        // To convert that set in  array formate
        const updatedDestroyArray = Array.from(updatedDestroyArraySet, JSON.parse);
        client.node.context.destroy = updatedDestroyArray
    }
}

module.exports = { symbolRevealFeatureCheck }
