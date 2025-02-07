
require('dotenv').config()

const init = require('./controllers/actions_controller')
const context = require('./models/context')

context.bishopID = '' + Date.now() + '_' + (Math.floor(Math.random() * 10000))
init()
