const index = require('./index');
const { assertObjectHasOnlyKeys } = require('../../_test-helpers/utils');

describe('buffs index', () => {
	it('has expected API surface', () => {
		assertObjectHasOnlyKeys(index, [
			'convertProcEffectToBuffs',
			'convertPassiveEffectToBuffs',
			'BuffSource',
			'BuffStackType',
		]);
	});
});
