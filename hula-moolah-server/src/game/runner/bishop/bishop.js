
require('dotenv').config()

const { exportSettingToCsv } = require('./controllers/csv_controller')
const context = require('./models/context')

context.bishopID = '' + Date.now() + '_' + (Math.floor(Math.random() * 10000))
exportSettingToCsv()
