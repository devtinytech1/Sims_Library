
const { exec, execSync } = require('child_process')

function create({ dir }) {
  const options = { cwd: dir }
  function getPromise(command) {
    return new Promise((resolve, reject) => {
      try {
        const com = exec(command, options)
        let result
        com.stdout.on('data', data => result = data.toString())
        com.on('close', code => resolve(JSON.stringify({ code, result })))
        com.on('error', err => new Error(err.message))
      }
      catch (e) {
        reject(e)
      }
    })
  }
  function pull() {
    return getPromise('git pull')
  }
  function add() {
    return getPromise('git add .')
  }
  function reset() {
    return getPromise('git reset')
  }
  function commit() {
    const message = execSync('git log --oneline --format=%B -n 1 HEAD', options).toString()
    const prev = parseInt(message)
    const next = isNaN(prev) ? 0 : prev + 1
    // return exec(`git commit -m "${next}"`, options)
    return getPromise(`git commit -m "${next}"`)
  }

  function push() {
    // return exec('git push', options)
    return getPromise('git push')
  }

  function saveLogs(path) {
    return Promise.all([
      getPromise(`git --no-pager log --pretty=oneline > ${path}/logs.txt`),
      getPromise(`git show-ref --tags > ${path}/tags.txt`),
    ])
    // return getPromise(`git --no-pager log --pretty="%s | %cd" > ${dir}`)
  }

  return { pull, add, commit, reset, push, saveLogs }
}

module.exports = create
