const buffUtilities = require('../../src/buffs');
const buffMetadata = require('../../src/buff-metadata');

describe('buff utilties', () => {
	const ARBITRARY_ATTACKING_PROC_ID = '1';
	const ARBITRARY_NON_ATTACKING_PROC_ID = '3';
	const ARBITRARY_INVALID_PROC_ID = '-1';

	describe('test setup', () => {
		// testing the arbitrary variables to ensure validity of test inputs since it is all based on the generated buff metadata
		it('has an attacking proc id for ARBITRARY_ATTACKING_PROC_ID', () => {
			const metadataEntry = buffMetadata.PROC_METADATA[ARBITRARY_ATTACKING_PROC_ID];
			expect(metadataEntry).toBeTruthy(`No metadata entry found for proc id ${ARBITRARY_ATTACKING_PROC_ID}`);
			expect(metadataEntry.Type).toBeTruthy(`No type found for proc id ${ARBITRARY_ATTACKING_PROC_ID}`);
			expect(metadataEntry.Type).toBe(buffMetadata.ProcBuffType.Attack, `Proc ID ${ARBITRARY_ATTACKING_PROC_ID} is not type ${buffMetadata.ProcBuffType.Attack}`);
		});

		it('has an non-attacking proc id for ARBITRARY_NON_ATTACKING_PROC_ID', () => {
			const metadataEntry = buffMetadata.PROC_METADATA[ARBITRARY_NON_ATTACKING_PROC_ID];
			expect(metadataEntry).toBeTruthy(`No metadata entry found for proc id ${ARBITRARY_NON_ATTACKING_PROC_ID}`);
			expect(metadataEntry.Type).toBeDefined(`No type found for proc id ${ARBITRARY_NON_ATTACKING_PROC_ID}`);
			expect(metadataEntry.Type).not.toBe(buffMetadata.ProcBuffType.Attack, `Proc ID ${ARBITRARY_NON_ATTACKING_PROC_ID} should not be type ${buffMetadata.ProcBuffType.Attack}`);
		});

		it('has an invalid proc id for ARBITRARY_INVALID_PROC_ID', () => {
			const metadataEntry = buffMetadata.PROC_METADATA[ARBITRARY_INVALID_PROC_ID];
			expect(metadataEntry).toBeUndefined(`No metadata entry should be found for proc id ${ARBITRARY_ATTACKING_PROC_ID}`);
		});
	});

	it('has expected API surface', () => {
		const expectedSurface = [
			'isAttackingProcId',
		].sort();
		expect(Object.keys(buffUtilities).sort()).toEqual(expectedSurface);
	});

	describe('isAttackingProcId', () => {
		[
			{
				input: ARBITRARY_ATTACKING_PROC_ID,
				name: 'an attacking proc id',
				expectedValue: true,
			},
			{
				input: ARBITRARY_NON_ATTACKING_PROC_ID,
				name: 'a valid but non-attacking proc id',
				expectedValue: false,
			},
			{
				input: ARBITRARY_INVALID_PROC_ID,
				name: 'an invalid proc id',
				expectedValue: false,
			},
			{
				input: void 0,
				name: 'an undefined id',
				expectedValue: false,
			},
			{
				input: null,
				name: 'a null id',
				expectedValue: false,
			},
		].forEach(testCase => {
			it(`returns ${testCase.expectedValue} for ${testCase.name}`, () => {
				expect(buffUtilities.isAttackingProcId(testCase.input)).toBe(testCase.expectedValue);
			});
		});
	});
});
