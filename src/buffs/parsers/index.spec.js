const index = require('./index');
const { assertObjectHasOnlyKeys } = require('../../_test-helpers/utils');

describe('buffs index', () => {
	it('has expected API surface', () => {
		assertObjectHasOnlyKeys(index, [
			'convertProcEffectToBuffs',
			'convertPassiveEffectToBuffs',
			'convertConditionalEffectToBuffs',
			'BuffSource',
			'BuffStackType',
			'BUFF_METADATA',
			'getMetadataForBuff',
		]);
	});
});
