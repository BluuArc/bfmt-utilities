const buffIndex = require('./index');
const { assertObjectHasOnlyKeys } = require('../_test-helpers/utils');

describe('buffs index', () => {
	it('has expected API surface', () => {
		assertObjectHasOnlyKeys(buffIndex, [
			'getMetadataForProc',
			'getMetadataForPassive',
			'isAttackingProcId',
			'getNameForProc',
			'getNameForPassive',
			'isProcEffect',
			'isPassiveEffect',
			'combineEffectsAndDamageFrames',
			'getEffectId',
			'getEffectName',
		]);
	});
});
