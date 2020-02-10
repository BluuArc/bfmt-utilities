const { watch, series } = require('gulp');
const buildTasks = require('./build');
const testTasks = require('./test');
const cleanupTasks = require('./cleanup');
const utils = require('./utils');

const fullBuild = series(testTasks.lintApplication, buildTasks.build, buildTasks.buildDocs);

function runDev () {
	const logger = utils.createLogger('Watcher');
	function notifyReadiness (done) {
		logger.log('watching for changes');
		done();
	}
	const onChange = series(cleanupTasks.cleanupCoverageFiles, testTasks.runCoverage, fullBuild, notifyReadiness);
	watch(['../src/**/*.ts', '../.eslintrc.ts.js', '!../src/**/*.d.ts', '!../src/version.ts'], onChange);
	watch(['../typedoc.config.js', '../README.md'], series(buildTasks.buildDocs, notifyReadiness));
	watch(['../test/**/*.js', '../test/jasmine.json', '../nyc.config.js'], series(testTasks.lintTests, cleanupTasks.cleanupCoverageFiles, testTasks.runCoverage, notifyReadiness));
	watch(['./**/*.js'], series(testTasks.lintTasks, notifyReadiness));
	return onChange();
}

module.exports = {
	'build': fullBuild,
	'build:dirty': buildTasks.build,
	'update-data': buildTasks.updateBuffMetadata,
	'dev': runDev,
	'cleanup:coverage': cleanupTasks.cleanupCoverageFiles,
};
