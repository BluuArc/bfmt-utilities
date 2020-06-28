const { series } = require('gulp');
const buildTasks = require('./build');
const testTasks = require('./test');
const cleanupTasks = require('./cleanup');

const fullBuild = series(testTasks.lintApplication, buildTasks.build, buildTasks.buildDocs);

module.exports = {
	'build': fullBuild,
	'build:dirty': buildTasks.build,
	'update:data': buildTasks.updateBuffMetadata,
	'cleanup:coverage': cleanupTasks.cleanupCoverageFiles,
};
