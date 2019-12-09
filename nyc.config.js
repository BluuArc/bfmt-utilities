const defaultExcludes = require('@istanbuljs/schema').nyc.properties.exclude.default;

module.exports = {
	'check-coverage': true,
	exclude: defaultExcludes.concat([
		'src/index.js', // avoid testing transpiled importStar code
		'src/version.js', // no need to test auto-generated file
	]),
};
