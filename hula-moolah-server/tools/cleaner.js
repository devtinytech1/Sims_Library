const fs = require('fs')

function create({ root }) {
  return async function clean() {
    return fs.promises.rmdir(`${root}/src`, { recursive: true })
  }
}

module.exports = create
