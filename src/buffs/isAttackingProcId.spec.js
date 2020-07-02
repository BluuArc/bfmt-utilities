const testConstants = require('../_test-helpers/constants');
const isAttackingProcId = require('./isAttackingProcId').default;
const { ProcBuffType } = require('./effect-metadata');

describe('isAttackingProcId method', () => {
	describe('for invalid metadata inputs', () => {
		[
			{
				name: 'is null',
				value: null,
			},
			{
				name: 'is not an object',
				value: 'some value',
			},
		].forEach(testCase => {
			it(`returns empty string if the metadata parameter ${testCase.name}`, () => {
				const result = isAttackingProcId(testConstants.KNOWN_ARBITRARY_ATTACKING_PROC_ID, testCase.value);
				expect(result).toBeFalse();
			});
		});
	});

	describe('when a valid metadata object is passed in', () => {
		const arbitraryId = 'arbitrary id';
		const arbitraryNonAttackingId = 'arbitrary non-attacking id';
		const arbitraryMissingId = 'arbitrary missing id';

		[
			{
				input: void 0,
				name: 'an undefined id',
			},
			{
				input: null,
				name: 'a null id',
			},
			{
				input: arbitraryMissingId,
				name: 'a proc id not in the metadata',
			},
			{
				input: arbitraryId,
				name: 'a proc id without a Type',
			},
			{
				input: arbitraryNonAttackingId,
				name: 'a proc id whose type is not attacking',
			},
		].forEach(testCase => {
			it(`returns false for ${testCase.name}`, () => {
				const metadata = {
					[arbitraryId]: { ID: arbitraryId },
					[arbitraryNonAttackingId]: { ID: arbitraryNonAttackingId, Type: 'arbitrary type' },
				};
				const result = isAttackingProcId(testCase.input, metadata);
				expect(result).toBeFalse();
			});
		});

		it(`returns true for a proc id whose metadata type is ${ProcBuffType.Attack}`, () => {
			const metadata = { [arbitraryId]: { ID: arbitraryId, Type: ProcBuffType.Attack } };
			const result = isAttackingProcId(arbitraryId, metadata);
			expect(result).toBeTrue();
		});
	});

	it('defaults to PROC_METADATA when metadata is not specified', () => {
		const result = isAttackingProcId(testConstants.KNOWN_ARBITRARY_ATTACKING_PROC_ID);
		expect(result).toBeTrue();
	});
});
