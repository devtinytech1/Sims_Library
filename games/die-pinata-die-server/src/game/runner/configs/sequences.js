
const settingsByKey = { sequences94: require('./sequences94.js') }

module.exports.get = function (key) {
  if (!key) {
    return settingsByKey.sequences94
  }
  if (!settingsByKey[key]) {
    try {
      settingsByKey[key] = require('./sequences' + key.slice(8))
    }
    catch (e) {
      return settingsByKey.sequences94
    }
  }
  return settingsByKey[key] ? settingsByKey[key] : settingsByKey.sequences94
}
