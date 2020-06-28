const testConstants = require('../_test-helpers/constants');
const getNameForPassive = require('./getNameForPassive').default;

describe('getNameForPassive method', () => {
	[
		{
			input: testConstants.KNOWN_ARBITRARY_PASSIVE_ID,
			name: 'a valid passive id',
			shouldHaveEntry: true,
		},
		{
			input: testConstants.ARBITRARY_INVALID_PASSIVE_ID,
			name: 'an invalid passive id',
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
			const result = getNameForPassive(testCase.input);
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
