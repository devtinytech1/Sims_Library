
const fs = require('fs')
const path = require('path')

async function copyFile(from, to) {
  return new Promise((resolve, reject) => {
    const done = err => err ? reject(err) : resolve()
    const rd = fs.createReadStream(from)
    rd.on('error', done)
    const wr = fs.createWriteStream(to)
    wr.on('error', done)
    wr.on('close', () => done())
    rd.pipe(wr)
  })
}
async function copyDir(from, to, filter) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(to)) {
      fs.mkdirSync(to, { recursive: true })
    }
    fs.readdir(from, (err, files) => {
      const list = filter ?
        files.filter(name => !filter.includes(name)) :
        files
      Promise.all(list.map(name => {
        const pth = path.join(from, name)
        return fs.lstatSync(pth).isDirectory() ? copyDir(pth, path.join(to, name), filter) : copyFile(pth, path.join(to, name))
      })).then(resolve, reject)
    })
  })
}
async function copy([from, to, exclude]) {
  if (from.includes('**')) {
    return new Promise((resolve, reject) => {
      const dir = from.split('**')[0]
      copyDir(dir, to, exclude).then(resolve, reject)
    })
  }
  else if (from.includes('*.{')) {
    return new Promise((resolve, reject) => {
      const spl = from.split('*.{')
      const filter = spl[1].split(',')
      filter[filter.length - 1].replace('}', '')
      copyDir(spl[0], to, filter).then(resolve, reject)
    })
  }
  return copyFile(from, to)
}
module.exports = async function (templates) {
  return Promise.all(templates.map(copy))
}
