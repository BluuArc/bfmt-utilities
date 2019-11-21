const { buildApp } = require('./build-app');
const { updateBuffMetadata } = require('./build-data');
module.exports = {
	build: buildApp,
	updateBuffMetadata,
};
