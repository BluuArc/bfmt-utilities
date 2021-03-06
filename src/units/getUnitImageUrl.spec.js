const getUnitImageUrl = require('./getUnitImageUrl').default;

describe('getUnitImageUrl method', () => {
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
				const expectedResult = `${baseContentUrlTestCase.expectedValueForParameter}/unit/img/${filenameTestCase.expectedValueForParameter}`;
				expect(getUnitImageUrl(baseContentUrlTestCase.value, filenameTestCase.value)).toBe(expectedResult);
			});
		});
	});
});
