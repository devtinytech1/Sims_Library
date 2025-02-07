/* eslint-disable import/order */

const fs = require('fs')
const filesForCheck = require('./configs/check_files.js').get()
const { getNode } = require('./controllers/node_controller')
const { getClient } = require('../../../../../src/models/client.cjs')
const crypto = require('crypto')

async function audit() {
  return new Promise(resolve => {
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

            }
            res()
          }),
      )
    }
    Promise.all(Object.keys(filesForCheck).map(getSum))
      .then(() => resolve({ checksums: audit_checksum }))
      .catch(err => resolve({ checksums: Object.assign(err, audit_checksum) }))
  })
}

async function init(requestData, cfg) {
  return await run(requestData, cfg)
}

async function play(requestData) {
  return await run(requestData)
}

async function run(requestData, init) {
  const client = await getClient(requestData, init)
  const { data, totalBet, gameRoundOver, totalWin, roundRestore } = await getNode(client)
  const stash = data.stash
  delete data.stash
  return { data, gameState: stash, totalBet, gameRoundOver, totalWin, roundRestore }
}

module.exports = { init, play, audit }
