const buffUtilities = require('../../src/buffs');
const testConstants = require('../helpers/constants');

describe('buff utilties', () => {
	it('has expected API surface', () => {
		const expectedSurface = [
			'isAttackingProcId',
		].sort();
		expect(Object.keys(buffUtilities).sort()).toEqual(expectedSurface);
	});

	describe('isAttackingProcId', () => {
		[
			{
				input: testConstants.ARBITRARY_ATTACKING_PROC_ID,
				name: 'an attacking proc id',
				expectedValue: true,
			},
			{
				input: testConstants.ARBITRARY_NON_ATTACKING_PROC_ID,
				name: 'a valid but non-attacking proc id',
				expectedValue: false,
			},
			{
				input: testConstants.ARBITRARY_INVALID_PROC_ID,
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
