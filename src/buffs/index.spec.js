const index = require('./index');
const { assertObjectHasOnlyKeys } = require('../_test-helpers/utils');

describe('buffs index', () => {
	it('has expected API surface', () => {
		assertObjectHasOnlyKeys(index, [
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
			'ProcBuffType',
			'PASSIVE_METADATA',
			'PROC_METADATA',
		]);
	});
});
