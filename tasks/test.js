const { runNpmCommand } = require('./utils');

function lintApplication (done) {
	return runNpmCommand(['lint'], 'eslint').then(() => done());
}

module.exports = {
	lintApplication,
};
