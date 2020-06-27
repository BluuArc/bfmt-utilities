const getSpEntryId = require('./getSpEntryId').default;

describe('getSpEntryId method', () => {
	describe('for non-string values for id', () => {
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
		].forEach(testCase => {
			it(`returns the original input if id ${testCase.name}`, () => {
				expect(getSpEntryId(testCase.value)).toBe(testCase.value);
			});
		});
	});

	it('returns the value after the @ character if it exists', () => {
		const input = 'some@value';
		expect(getSpEntryId(input)).toBe('value');
	});

	it('returns the original value if there is no data after the @ character', () => {
		const input = 'some@';
		expect(getSpEntryId(input)).toBe('some@');
	});

	it('returns the original value if there is no @ character', () => {
		const input = 'somevalue';
		expect(getSpEntryId(input)).toBe(input);
	});
});
