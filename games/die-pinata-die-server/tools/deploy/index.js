
require('dotenv').config()

const fs = require('fs')
const path = require('path')
const commander = require('./commander')
const copier = require('./copier')

const { DEPLOY_FOLDER } = process.env
const root = `../../deploy/${DEPLOY_FOLDER}-server`

async function run() {
  try {
    const command = commander({ dir: path.join(__dirname, `../${root}`) })
    console.log(`pull: ${await command.pull()}`)

    console.log('await cleaner')
    let pth = path.join(__dirname, `../${root}/src`)
    await fs.promises.rmdir(pth, { recursive: true })

    pth = path.join(__dirname, `../${root}/package.json`)
    if (fs.existsSync(pth)) {
      fs.unlinkSync(pth)
    }
    console.log('await copier')
    const templates = [
      ['../package.json', `${root}/package.json`],
      ['../src/**', `${root}/src`],
      [`../src/game/runner/**`, `${root}/src/game/runner`],
    ].map(arr => arr.map(pth => typeof pth === 'string' ? path.resolve(__dirname, '../', pth) : pth))
    await copier(templates)

    pth = path.join(__dirname, `../${root}/src/game/time.json`)
    fs.existsSync(pth) && fs.unlinkSync(pth)
    fs.writeFileSync(pth, `{"value":${Date.now()}}`, err => console.log(err))

    console.log(`add: ${await command.add()}`)
    console.log(`commit: ${await command.commit()}`)
    console.log(`push: ${await command.push()}`)
  }
  catch (e) {
    console.error(e)
  }
}

run()
