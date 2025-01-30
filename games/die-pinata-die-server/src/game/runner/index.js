/* eslint-disable import/order */

const fs = require('fs')
const { error } = require('../../tools/log')
const filesForCheck = require('../../../../../src/game/runner/configs/check_files.cjs').get()
const { execute } = require('./controllers/actions_controller')
const { getClient } = require('./models/client')
const crypto = require('crypto')

async function audit() {
  const audit_checksum = {}
  async function getSum(fileName) {
    return new Promise(res =>
      fs.readFile(filesForCheck[fileName],
        function (err, testFile) {
          if (!err) {
            let text = testFile.toString()
            audit_checksum[fileName] = crypto.createHash('sha1')
              .update(text)
              .digest('hex')
          }
          else {
            error({ err, msg: 'getSum' })
          }
          res()
        }),
    )
  }
  return Promise.all(Object.keys(filesForCheck).map(getSum))
    .then(() => ({ checksums: audit_checksum }))
    .catch(err => ({ checksums: Object.assign(err, audit_checksum) }))
}

async function init(requestData, cfg) {
  return await run(requestData, cfg)
}

async function play(requestData) {
  return await run(requestData)
}

async function run(requestData, init) {
  try {
    const client = await getClient(requestData, init)
    const { data, totalBet, gameRoundOver, totalWin, roundRestore } = await execute(client)
    return { data: data.clientData, gameState: data.serverData, totalBet, gameRoundOver, totalWin, roundRestore }
  }
  catch (e) {
    return { data: { error: e }, gameState: requestData.state, totalBet: 0, gameRoundOver: false, totalWin: 0 }
  }
}

module.exports = { init, play, audit }
