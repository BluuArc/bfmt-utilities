const { buildApp, buildDocs } = require('./build-app');
const { updateBuffMetadata } = require('./build-data');
module.exports = {
	build: buildApp,
	buildDocs,
	updateBuffMetadata,
};
