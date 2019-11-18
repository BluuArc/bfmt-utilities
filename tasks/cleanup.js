const { forAllFilesInFolder, createLogger } = require('./utils');
const path = require('path');
const fs = require('fs');

function cleanupCoverageFiles (done) {
	const logger = createLogger('cleanupCoverage');
	const allFiles = {};
	forAllFilesInFolder(path.join(__dirname, '..', 'src'), (filePath) => {
		if (typeof filePath === 'string') {
			allFiles[filePath] = true;
		}
	});
	const JS_EXTENSION = '.js';
	const D_TS_EXTENSION = '.d.ts';
	const isTranspiledJsFile = (filePath = '') => {
		const isJsFile = filePath.endsWith(JS_EXTENSION);
		const correspondingTsFile = isJsFile && `${filePath.slice(0, filePath.length - JS_EXTENSION.length)}.ts`;
		return isJsFile && fs.existsSync(correspondingTsFile);
	};
	const isGeneratedDefinitionFile = (filePath = '') => {
		const isTypeDefinitionFile = filePath.endsWith(D_TS_EXTENSION);
		const correspondingTsFile = isTypeDefinitionFile && `${filePath.slice(0, filePath.length - D_TS_EXTENSION.length)}.ts`;
		return isTypeDefinitionFile && fs.existsSync(correspondingTsFile);
	};
	Object.keys(allFiles).forEach(filePath => {
		if (isTranspiledJsFile(filePath) || isGeneratedDefinitionFile(filePath)) {
			logger.log(`Removing ${filePath}`);
			fs.unlinkSync(filePath);
		}
	});
	done();
}

module.exports = {
	cleanupCoverageFiles,
};
