require('dotenv').config()
const gulp = require('gulp')
const cleaner = require('./tools/cleaner')
const commander = require('./tools/commander')
const copier = require('./tools/copier')

const { GAME } = process.env
const root = `../deploy/${GAME}-server`.toLowerCase()
const args = { game: GAME, root }
const command = commander(args)

const deploy = gulp.series(
  command.pull,
  cleaner(args),
  copier(args),
  command.add,
  command.commit,
  command.push,
)

module.exports = { deploy }
