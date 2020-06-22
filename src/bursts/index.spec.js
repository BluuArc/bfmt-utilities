const index = require('./index');
const { assertObjectHasOnlyKeys } = require('../_test-helpers/utils');

describe('bursts index', () => {
	it('has expected API surface', () => {
		assertObjectHasOnlyKeys(index, [
			'getLevelEntryForBurst',
			'getEffectsForBurst',
			'getExtraAttackDamageFramesEntry',
		]);
	});
});
