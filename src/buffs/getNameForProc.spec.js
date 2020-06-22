const testConstants = require('../_test-helpers/constants');
const getNameForProc = require('./getNameForProc').default;

describe('getNameForProc method', () => {
	[
		{
			input: testConstants.ARBITRARY_ATTACKING_PROC_ID,
			name: 'a valid proc id',
			shouldHaveEntry: true,
		},
		{
			input: testConstants.ARBITRARY_INVALID_PROC_ID,
			name: 'an invalid proc id',
			shouldHaveEntry: false,
		},
		{
			input: void 0,
			name: 'an undefined id',
			shouldHaveEntry: false,
		},
		{
			input: null,
			name: 'a null id',
			shouldHaveEntry: false,
		},
	].forEach(testCase => {
		it(`returns ${testCase.shouldHaveEntry ? 'a string' : 'an empty string'} for ${testCase.name}`, () => {
			const result = getNameForProc(testCase.input);
			expect(typeof result === 'string')
				.withContext('result is not a string')
				.toBe(true);
			if (testCase.shouldHaveEntry) {
				expect(result.length)
					.withContext('result is an empty etring')
					.toBeGreaterThan(0);
			} else {
				expect(result.length)
					.withContext('result is not an empty string')
					.toBe(0);
			}
		});
	});
});
