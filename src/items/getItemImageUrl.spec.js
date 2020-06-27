const getItemImageUrl = require('./getItemImageUrl').default;

describe('getItemImageUrl method', () => {
	const testCases = [
		{
			name: 'is null',
			value: null,
			expectedValueForParameter: '',
		},
		{
			name: 'is undefined',
			value: void 0,
			expectedValueForParameter: '',
		},
		{
			name: 'is a string',
			value: 'some string',
			expectedValueForParameter: 'some string',
		},
	];

	testCases.forEach(baseContentUrlTestCase => {
		testCases.forEach(filenameTestCase => {
			it(`returns expected string when baseContentUrl ${baseContentUrlTestCase.name} and filename ${filenameTestCase.name}"`, () => {
				const expectedResult = `${baseContentUrlTestCase.expectedValueForParameter}/item/${filenameTestCase.expectedValueForParameter}`;
				expect(getItemImageUrl(baseContentUrlTestCase.value, filenameTestCase.value)).toBe(expectedResult);
			});
		});
	});
});
