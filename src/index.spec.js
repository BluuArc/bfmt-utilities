const index = require('./index').default;
const { assertObjectHasOnlyKeys } = require('./_test-helpers/utils');

describe('application entry point', () => {
	it('has expected API surface', () => {
		assertObjectHasOnlyKeys(index, [
			'bursts',
			'buffs',
			'datamineTypes',
			'extraSkills',
			'items',
			'leaderSkills',
			'units',
			'spEnhancements',
			'version',
		]);
	});
});
