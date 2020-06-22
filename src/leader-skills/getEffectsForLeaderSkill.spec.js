const getEffectsForLeaderSkill = require('./getEffectsForLeaderSkill').default;

describe('getEffectsForLeaderSkill method', () => {
	describe('for invalid values for skill', () => {
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
				name: 'is not an object',
				value: 'some string',
			},
			{
				name: 'is an object where obj.effects does not exist',
				value: { some: 'property' },
			},
			{
				name: 'is an object obj.effects is not an array',
				value: { effects: 'some string' },
			},
		].forEach(testCase => {
			it(`returns an empty array if skill parameter ${testCase.name}`, () => {
				expect(getEffectsForLeaderSkill(testCase.value)).toEqual([]);
			});
		});
	});

	it('returns the effects array of the given skill', () => {
		const inputSkill = { effects: [{ some: 'effect' }] };
		expect(getEffectsForLeaderSkill(inputSkill)).toBe(inputSkill.effects);
	});
});
