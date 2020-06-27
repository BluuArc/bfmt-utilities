const index = require('./index');
const { assertObjectHasOnlyKeys } = require('../_test-helpers/utils');

describe('leader-skills index', () => {
	it('has expected API surface', () => {
		assertObjectHasOnlyKeys(index, [
			'getEffectsForLeaderSkill',
		]);
	});
});
