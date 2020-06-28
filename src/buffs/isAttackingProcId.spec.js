const testConstants = require('../_test-helpers/constants');
const isAttackingProcId = require('./isAttackingProcId').default;

describe('isAttackingProcId method', () => {
	[
		{
			input: testConstants.KNOWN_ARBITRARY_ATTACKING_PROC_ID,
			name: 'an attacking proc id',
			expectedValue: true,
		},
		{
			input: testConstants.KNOWN_ARBITRARY_NON_ATTACKING_PROC_ID,
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
			expect(isAttackingProcId(testCase.input)).toBe(testCase.expectedValue);
		});
	});
});
