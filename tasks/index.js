// const gulp = require('gulp');

const cleanup = require('./cleanup');
const build = require('./build');

// gulp.task('cleanup', cleanup);
exports.clean = cleanup;
exports['build:js'] = build.buildWebpack;
exports['build:es'] = build.buildEcmaScript;
