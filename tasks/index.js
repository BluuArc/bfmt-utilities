// const gulp = require('gulp');

const cleanup = require('./cleanup');
const build = require('./build');

// gulp.task('cleanup', cleanup);
exports['clean:build'] = cleanup.cleanBuild;
exports['clean:docs'] = cleanup.cleanDocs;
exports['build:js'] = build.buildWebpack;
exports['build:es'] = build.buildEcmaScript;
exports['build:docs'] = build.buildDocs;
