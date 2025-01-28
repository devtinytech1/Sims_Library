const { KEY, TRIGGER } = require('../../configs/static')
const features = require('../features/features')

module.exports.execute = async function(client)
{
    if(client.prevTrigger !== TRIGGER.FREESPINS_END || client.request.action !== TRIGGER.FREESPINS_END){
        return Promise.reject(KEY.INVALID_ACTION)
    }
    client.nextState = TRIGGER.SPIN
    client.nextTrigger = TRIGGER.SPIN
    features.init(client)
    features.prizePot.init(client)
    client.matrix = []
    client.matrix = client.prevContext.freespins.fs_triggering_matrix
    if(client.nextTrigger === TRIGGER.SPIN){
        client.setGameRoundOver()
    }
}