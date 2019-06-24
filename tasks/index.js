// const gulp = require('gulp');

const cleanup = require('./cleanup');
const build = require('./build');

// gulp.task('cleanup', cleanup);
exports.cleanup = cleanup;
exports.buildWebpack = build.buildWebpack;
