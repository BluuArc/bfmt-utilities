const { runNpmCommand } = require('./utils');

function lintApplication () {
	return runNpmCommand(['lint-app']);
}

function lintTasks () {
	return runNpmCommand(['lint-tasks']);
}

function lintTests () {
	return runNpmCommand(['lint-tests']);
}

function runTests () {
	return runNpmCommand(['test']);
}

function runCoverage () {
	return runNpmCommand(['coverage']);
}

module.exports = {
	lintApplication,
	lintTasks,
	lintTests,
	runTests,
	runCoverage,
};
