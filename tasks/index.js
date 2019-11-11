const testTasks = require('./test');
const { watch, series } = require('gulp');
const buildTasks = require('./build');
const utils = require('./utils');

const fullBuild = series(testTasks.lintApplication, buildTasks.build);

function runDev () {
	const logger = utils.createLogger('Watcher');
	function notifyReadiness (done) {
		logger.log('watching for changes');
		done();
	}
	const onChange = series(fullBuild, notifyReadiness);
	watch(['../src/**/*.ts', '../.eslintrc.ts.js'], onChange);
	return onChange();
}

module.exports = {
	'dirty-build': buildTasks.build,
	'build': fullBuild,
	'dev': runDev,
};
