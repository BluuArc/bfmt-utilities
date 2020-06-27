const index = require('./index');
const { assertObjectHasOnlyKeys } = require('../_test-helpers/utils');

describe('units index', () => {
	it('has expected API surface', () => {
		assertObjectHasOnlyKeys(index, [
			'getUnitImageFileNames',
			'getUnitImageUrl',
		]);
	});
});
