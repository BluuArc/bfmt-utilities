const spCodeToIndex = require('./spCodeToIndex').default;

describe('spCodeToIndex method', () => {
	describe('for invalid values for code', () => {
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
				name: 'is a number',
				value: 5,
			},
			{
				name: 'is an invalid character',
				value: '-',
			},
			{
				name: 'is an empty string',
				value: '',
			},
			{
				name: 'is a string of more than one character',
				value: 'some string',
			},
		].forEach(testCase => {
			it(`returns -1 if code ${testCase.name}`, () => {
				expect(spCodeToIndex(testCase.value)).toBe(-1);
			});
		});
	});

	[
		{
			range: 'between A and Z inclusive',
			cases: [
				[0, 'A'],
				[9, 'J'],
				[25, 'Z'],
			],
		},
		{
			range: 'between a and z inclusive',
			cases: [
				[26, 'a'],
				[35, 'j'],
				[51, 'z'],
			],
		},
		{
			range: 'between 0 and 9 inclusive',
			cases: [
				[52, '0'],
				[57, '5'],
				[61, '9'],
			],
		},
	].forEach(({ range, cases }) => {
		describe(`when code is ${range}`, () => {
			cases.forEach(([expectedResult, value]) => {
				it(`returns ${expectedResult} for input ${value}`, () => {
					expect(spCodeToIndex(value)).toBe(expectedResult);
				});
			});
		});
	});
});
