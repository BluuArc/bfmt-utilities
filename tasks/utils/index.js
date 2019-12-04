const fs = require('fs');
const path = require('path');
const { createLogger } = require('./logger');
const { runNpmCommand } = require('./run-npm-command');

function forAllFilesInFolder (folderPath, fn = () => {}) {
	if (fs.existsSync(folderPath)) {
		fs.readdirSync(folderPath).forEach(entry => {
			const entryPath = path.join(folderPath, entry);
			if (fs.lstatSync(entryPath).isDirectory()) {
				forAllFilesInFolder(entryPath, fn);
			} else {
				fn(entryPath);
			}
		});
	}
}

module.exports = {
	createLogger,
	runNpmCommand,
	forAllFilesInFolder,
};
