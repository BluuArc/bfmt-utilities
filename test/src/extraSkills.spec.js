const extraSkillUtilities = require('../../src/extra-skills');

describe('extra skill utilities', () => {
	it('has expected API surface', () => {
		const expectedSurface = [
			'getExtraSkillEffects',
		].sort();
		expect(Object.keys(extraSkillUtilities).sort()).toEqual(expectedSurface);
	});

	describe('getExtraSkillEffects method', () => {
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
					name: 'is an object without an effects property',
					value: { some: 'property' },
				},
				{
					name: 'is an object with an effects property that is not an array',
					value: { effects: 'some string' },
				},
			].forEach(testCase => {
				it(`returns an empty array if skill parameter ${testCase.name}`, () => {
					expect(extraSkillUtilities.getExtraSkillEffects(testCase.value)).toEqual([]);
				});
			});
		});

		it('returns the effects array of the given skill', () => {
			const inputSkill = { effects: [{ some: 'effect' }] };
			expect(extraSkillUtilities.getExtraSkillEffects(inputSkill)).toBe(inputSkill.effects);
		});
	});
});
