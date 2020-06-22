const isPassiveEffect = require('./isPassiveEffect').default;

describe('isPassiveEffect method', () => {
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
			name: 'is an object but it does not have any of the passive ID keys',
			value: { some: 'property' },
		},
	].forEach(testCase => {
		it(`returns false string when the effect parameter ${testCase.name}`, () => {
			expect(isPassiveEffect(testCase.value)).toBe(false);
		});
	});

	const ARBITRARY_STRING = 'some string';
	['passive id', 'unknown passive id'].forEach(key => {
		it(`returns true if the effect parameter is an object that has a ${key} property`, () => {
			const inputEffect = { [key]: ARBITRARY_STRING };
			expect(isPassiveEffect(inputEffect)).toBe(true);
		});
	});
});
