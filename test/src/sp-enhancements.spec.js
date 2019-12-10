const spEnhancementUtilities = require('../../src/sp-enhancements');

describe('SP Enhancement utilities', () => {
	it('has expected API surface', () => {
		const expectedSurface = [
			'getEffectsForSpEnhancement',
		].sort();
		expect(Object.keys(spEnhancementUtilities).sort()).toEqual(expectedSurface);
	});

	describe('getEffectsForSpEnhancement method', () => {
		describe('for invalid values for entry', () => {
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
					name: 'is an object where obj.skill does not exist',
					value: { some: 'property' },
				},
				{
					name: 'is an object where obj.skill is not an object',
					value: { skill: 'some string' },
				},
				{
					name: 'is an object where obj.skill.effects does not exist',
					value: { skill: { some: 'property' } },
				},
				{
					name: 'is an object where obj.skill.effects is not an array',
					value: { skill: { effects: 'some string' } },
				},
			].forEach(testCase => {
				it(`returns an empty array if skill parameter ${testCase.name}`, () => {
					expect(spEnhancementUtilities.getEffectsForSpEnhancement(testCase.value)).toEqual([]);
				});
			});
		});

		it('returns an unwrapped version of effects of the given SP entry', () => {
			const numberOfInputs = 5;
			const arbitrarySpTypes = Array.from({ length: numberOfInputs }, (_, i) => `arbitrary sp type ${i}`);
			const inputSkill = {
				skill: {
					effects: Array.from({ length: numberOfInputs }, (_, i) => ({
						[arbitrarySpTypes[i]]: { some: `effect-${i}` },
					})),
				},
			};
			const expectedResult = Array.from({ length: numberOfInputs }, (_, i) => ({
				some: `effect-${i}`,
				sp_type: arbitrarySpTypes[i],
			}));
			const result = spEnhancementUtilities.getEffectsForSpEnhancement(inputSkill);
			expect(result).toEqual(expectedResult);
		});
	});
});
