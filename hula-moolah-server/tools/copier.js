const gulp = require('gulp')

function toTask([from, to, ignore]) {
  return function copy() {
    return gulp.src(from, { ignore }).pipe(gulp.dest(to))
  }
}

function create({ root }) {
  const templates = [
    ['./package.json', `${root}`],
    ['./src/**', `${root}/src`, ['**/bishop/**']],
  ]
  return templates.map(toTask)
}

module.exports = create
