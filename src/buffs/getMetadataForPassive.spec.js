const testConstants = require('../_test-helpers/constants');
const getMetadataForPassive = require('./getMetadataForPassive').default;

describe('getMetadataForPassive method', () => {
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
		it(`returns ${testCase.shouldHaveEntry ? 'an object' : 'undefined'} for ${testCase.name}`, () => {
			const result = getMetadataForPassive(testCase.input);
			if (testCase.shouldHaveEntry) {
				expect(result)
					.withContext('result does not exist')
					.toBeTruthy();
				expect(typeof result === 'object')
					.withContext('result is not an object')
					.toBe(true);
			} else {
				expect(result)
					.withContext('result is not undefined')
					.toBe(undefined);
			}
		});
	});
});
