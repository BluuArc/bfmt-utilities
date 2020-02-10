const { exec } = require('gulp-execa');

function runNpmCommand (command = []) {
	return exec(['npm run'].concat(command).join(' '));
}

module.exports = {
	runNpmCommand,
};
