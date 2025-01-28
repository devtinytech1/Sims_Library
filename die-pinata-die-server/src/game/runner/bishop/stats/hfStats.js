
function getModel() {
  return {
    triggered: 0,
    HF: 0,
  }
}

function update(statsBase, spinCount) {
  statsBase.HF = spinCount / statsBase.triggered
  return true
}

module.exports = { getModel, update }
