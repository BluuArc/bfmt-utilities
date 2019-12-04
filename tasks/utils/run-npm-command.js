const run = require('gulp-run');

function runNpmCommand (command = []) {
	return run(['npm run'].concat(command).join(' ')).exec();
}

module.exports = {
	runNpmCommand,
};
