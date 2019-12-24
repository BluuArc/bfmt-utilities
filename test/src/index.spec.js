const appExport = require('../../src/index');
const { assertObjectHasOnlyKeys } = require('../helpers/utils');
const app = appExport.default;

describe('application entry point', () => {
	it('has expected API surface', () => {
		assertObjectHasOnlyKeys(app, [
			'bursts',
			'buffs',
			'extraSkills',
			'items',
			'leaderSkills',
			'units',
			'spEnhancements',
			'version',
		]);
	});
});
