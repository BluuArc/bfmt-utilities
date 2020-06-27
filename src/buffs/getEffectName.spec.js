const testConstants = require('../_test-helpers/constants');
const { PROC_METADATA, PASSIVE_METADATA } = require('./buff-metadata');
const getEffectName = require('./getEffectName').default;

describe('getEffectName method', () => {
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
			expect(getEffectName(testCase.value)).toBe('');
		});
	});

	[
		['proc id', testConstants.ARBITRARY_ATTACKING_PROC_ID, PROC_METADATA[testConstants.ARBITRARY_ATTACKING_PROC_ID].Name],
		['unknown proc id', testConstants.ARBITRARY_ATTACKING_PROC_ID, PROC_METADATA[testConstants.ARBITRARY_ATTACKING_PROC_ID].Name],
		['passive id', testConstants.ARBITRARY_PASSIVE_ID, PASSIVE_METADATA[testConstants.ARBITRARY_PASSIVE_ID].Name],
		['unknown passive id', testConstants.ARBITRARY_PASSIVE_ID, PASSIVE_METADATA[testConstants.ARBITRARY_PASSIVE_ID].Name],
	].forEach(([key, value, expectedName]) => {
		it(`returns the value for ${key} if the effect parameter is an object that has a ${key} property`, () => {
			const inputEffect = { [key]: value };
			expect(expectedName.length)
				.withContext('expected name is empty')
				.toBeGreaterThan(0);
			expect(getEffectName(inputEffect)).toBe(expectedName);
		});
	});
});
