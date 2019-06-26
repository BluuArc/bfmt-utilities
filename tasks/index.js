const { series, parallel } = require('gulp');

const cleanup = require('./cleanup');
const build = require('./build');

// gulp.task('cleanup', cleanup);
exports['clean:app'] = cleanup.cleanBuild;
exports['clean:docs'] = cleanup.cleanDocs;
exports['build:js'] = build.buildWebpack;
exports['build:es'] = build.buildTypeScript;
exports['build:docs'] = build.buildDocs;
exports['build:app'] = parallel(build.buildWebpack, build.buildTypeScript);
