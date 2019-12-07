const defaultExcludes = require('@istanbuljs/schema').nyc.properties.exclude.default;

module.exports = {
	'check-coverage': true,
	exclude: defaultExcludes.concat([
		'src/index.js', // excluded to avoid testing transpiled importStar code
	]),
};
