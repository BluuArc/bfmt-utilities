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

	watch(['../src/**/*.ts', '../.eslintrc.ts.js', '!../src/version.ts'], series(cleanupTasks.cleanupCoverageFiles, testTasks.lintApplication, testTasks.runCoverage, notifyReadiness));
	watch(['../src/**/*.spec.js', '../src/_test-helpers/**/*.js', '../jasmine.json', '../nyc.config.js'], series(testTasks.lintTests, testTasks.runCoverageTestsOnly, notifyReadiness));
	watch(['./**/*.js'], series(testTasks.lintTasks, notifyReadiness));
	notifyReadiness(() => {});
}

module.exports = {
	'build': fullBuild,
	'build:dirty': buildTasks.build,
	'update:data': buildTasks.updateBuffMetadata,
	'dev': runDev,
	'cleanup:coverage': cleanupTasks.cleanupCoverageFiles,
};
