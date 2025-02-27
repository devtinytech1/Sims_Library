
const getSettings = function (key, settingsByKey) {
  if (!key) {
    return settingsByKey.settings94
  }
  if (!settingsByKey[key]) {
    try {
      settingsByKey[key] = require('./' + key)
    }
    catch (e) {
      return settingsByKey.settings94
    }
  }
  return settingsByKey[key] ? settingsByKey[key] : settingsByKey.settings94
}

module.exports = { getSettings }