const isProcEffect = require('./isProcEffect').default;

describe('isProcEffect method', () => {
	[
		{
			name: 'is undefined',
			value: (void 0),
		},
		{
			name: 'is null',
			value: null,
		},
		{
			name: 'is not an object',
			value: 123,
		},
		{
			name: 'is an object but it does not have any of the proc ID keys',
			value: { some: 'property' },
		},
	].forEach(testCase => {
		it(`returns false string when the effect parameter ${testCase.name}`, () => {
			expect(isProcEffect(testCase.value)).toBe(false);
		});
	});

	const ARBITRARY_STRING = 'some string';
	['proc id', 'unknown proc id'].forEach(key => {
		it(`returns true if the effect parameter is an object that has a ${key} property`, () => {
			const inputEffect = { [key]: ARBITRARY_STRING };
			expect(isProcEffect(inputEffect)).toBe(true);
		});
	});
});
