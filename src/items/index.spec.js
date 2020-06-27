const index = require('./index');
const { assertObjectHasOnlyKeys } = require('../_test-helpers/utils');

describe('items index', () => {
	it('has expected API surface', () => {
		assertObjectHasOnlyKeys(index, [
			'getEffectsForItem',
			'getItemImageUrl',
		]);
	});
});
