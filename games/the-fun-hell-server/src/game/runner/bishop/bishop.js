
require('dotenv').config()

const context = require('./models/context')

context.bishopID = '' + Date.now() + '_' + (Math.floor(Math.random() * 10000))
