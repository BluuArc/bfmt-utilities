const { runNpmCommand } = require('./utils');

function lintApplication (done) {
	return runNpmCommand(['lint-app'], 'eslint-app').then(() => done());
}

function lintTests (done) {
	return runNpmCommand(['lint-tests'], 'eslint-tests').then(() => done());
}

function runTests (done) {
	return runNpmCommand(['test'], 'tests').then(() => done());
}

module.exports = {
	lintApplication,
	lintTests,
	runTests,
};
