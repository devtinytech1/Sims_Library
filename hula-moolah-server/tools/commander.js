const { exec, execSync } = require('child_process')

function create({ root }) {
  const cwd = root
  const options = { cwd }

  function pull() {
    return exec('git pull', options)
  }

  function add() {
    return exec('git add .', options)
  }

  function commit() {
    const message = execSync('git log --oneline --format=%B -n 1 HEAD', options).toString()
    const prev = parseInt(message)
    const next = isNaN(prev) ? 0 : prev + 1
    return exec(`git commit -m "${next}"`, options)
  }

  function push() {
    return exec('git push', options)
  }

  return { pull, add, commit, push }
}

module.exports = create
