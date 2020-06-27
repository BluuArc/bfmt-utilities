const spIndexToCode = require('./spIndexToCode').default;

describe('spIndexToCode method', () => {
	describe('for invalid values for index', () => {
		[
			{
				name: 'is null',
				value: null,
			},
			{
				name: 'is undefined',
				value: void 0,
			},
			{
				name: 'is an object',
				value: { some: 'property' },
			},
			{
				name: 'is a string',
				value: 'some string',
			},
			{
				name: 'is not an integer',
				value: 1.23,
			},
			{
				name: 'is less than 0',
				value: -1,
			},
			{
				name: 'is greater than 61',
				value: 62,
			},
		].forEach(testCase => {
			it(`returns an empty string if index ${testCase.name}`, () => {
				expect(spIndexToCode(testCase.value)).toBe('');
			});
		});
	});

	[
		{
			range: 'between 0 and 25 inclusive',
			cases: [
				[0, 'A'],
				[9, 'J'],
				[25, 'Z'],
			],
		},
		{
			range: 'between 26 and 51 inclusive',
			cases: [
				[26, 'a'],
				[35, 'j'],
				[51, 'z'],
			],
		},
		{
			range: 'between 52 and 61 inclusive',
			cases: [
				[52, '0'],
				[57, '5'],
				[61, '9'],
			],
		},
	].forEach(({ range, cases }) => {
		describe(`when index is ${range}`, () => {
			cases.forEach(([value, expectedResult]) => {
				it(`returns ${expectedResult} for input ${value}`, () => {
					expect(spIndexToCode(value)).toBe(expectedResult);
				});
			});
		});
	});
});
