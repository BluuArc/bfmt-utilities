const { watch, series } = require('gulp');
const buildTasks = require('./build');
const testTasks = require('./test');
const cleanupTasks = require('./cleanup');
const utils = require('./utils');

const fullBuild = series(testTasks.lintApplication, buildTasks.build);

function runDev () {
	const logger = utils.createLogger('Watcher');
	function notifyReadiness (done) {
		logger.log('watching for changes');
		done();
	}
	const onChange = series(cleanupTasks.cleanupCoverageFiles, testTasks.runCoverage, fullBuild, notifyReadiness);
	watch(['../src/**/*.ts', '../.eslintrc.ts.js', '!../src/**/*.d.ts'], onChange);
	watch(['../test/**/*.js', '../test/jasmine.json'], series(testTasks.lintTests, cleanupTasks.cleanupCoverageFiles, testTasks.runCoverage, notifyReadiness));
	watch(['./**/*.js'], series(testTasks.lintTasks, notifyReadiness));
	return onChange();
}

module.exports = {
	'dirty-build': buildTasks.build,
	'build': fullBuild,
	'dev': runDev,
	'cleanup-coverage': cleanupTasks.cleanupCoverageFiles,
};
