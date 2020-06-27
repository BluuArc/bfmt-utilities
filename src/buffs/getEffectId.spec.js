const getEffectId = require('./getEffectId').default;

describe('getEffectId method', () => {
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
			name: 'is an object but it does not have any of the ID keys',
			value: { some: 'property' },
		},
	].forEach(testCase => {
		it(`returns an empty string when the effect parameter ${testCase.name}`, () => {
			expect(getEffectId(testCase.value)).toBe('');
		});
	});

	const ARBITRARY_STRING = 'some string';
	['proc id', 'unknown proc id', 'passive id', 'unknown passive id'].forEach(key => {
		it(`returns the value for ${key} if the effect parameter is an object that has a ${key} property`, () => {
			const inputEffect = { [key]: ARBITRARY_STRING };
			expect(getEffectId(inputEffect)).toBe(ARBITRARY_STRING);
		});
	});
});
