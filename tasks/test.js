const { runNpmCommand } = require('./utils');

function lintApplication (done) {
	return runNpmCommand(['lint-app'], 'eslint-app').then(() => done());
}

function lintTasks (done) {
	return runNpmCommand(['lint-tasks'], 'eslint-tasks').then(() => done());
}

function lintTests (done) {
	return runNpmCommand(['lint-tests'], 'eslint-tests').then(() => done());
}

function runTests (done) {
	return runNpmCommand(['test'], 'tests').then(() => done());
}

function runCoverage (done) {
	return runNpmCommand(['coverage'], 'coverage').then(() => done());
}

module.exports = {
	lintApplication,
	lintTasks,
	lintTests,
	runTests,
	runCoverage,
};
