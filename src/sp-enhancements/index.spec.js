const index = require('./index');
const { assertObjectHasOnlyKeys } = require('../_test-helpers/utils');

describe('sp-enhancements index', () => {
	it('has expected API surface', () => {
		assertObjectHasOnlyKeys(index, [
			'getEffectsForSpEnhancement',
			'getSpCategoryName',
			'spIndexToCode',
			'spCodeToIndex',
			'getSpEntryId',
			'getSpEntryWithId',
			'getAllDependenciesForSpEntry',
			'getAllEntriesThatDependOnSpEntry',
		]);
	});
});
