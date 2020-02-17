const spEnhancementUtilities = require('../../src/sp-enhancements');
const { assertObjectHasOnlyKeys } = require('../helpers/utils');

describe('SP Enhancement utilities', () => {
	it('has expected API surface', () => {
		assertObjectHasOnlyKeys(spEnhancementUtilities, [
			'getEffectsForSpEnhancement',
			'getSpCategoryName',
		]);
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

	describe('getSpCategoryName method', () => {
		describe('for invalid values for categoryId', () => {
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
					name: 'is not a string or a number',
					value: { some: 'property' },
				},
				{
					name: 'is not a numerical string',
					value: 'some string',
				},
				{
					name: 'is a number that doesn\'t have an associated entry',
					value: 0,
				},
				{
					name: 'is a string that doesn\'t have an associated entry',
					value: '0',
				},
			].forEach(testCase => {
				it(`returns 'Unknown' if categoryId ${testCase.name}`, () => {
					expect(spEnhancementUtilities.getSpCategoryName(testCase.value)).toBe('Unknown');
				});
			});
		});

		describe('for valid values for categoryId', () => {
			const EXPECTED_NAME_MAPPING = {
				'1': 'Parameter Boost',
				'2': 'Spark',
				'3': 'Critical Hits',
				'4': 'Attack Boost',
				'5': 'BB Gauge',
				'6': 'HP Recovery',
				'7': 'Drops',
				'8': 'Ailment Resistance',
				'9': 'Ailment Infliction',
				'10': 'Damage Reduction',
				'11': 'Special',
			};

			Object.entries(EXPECTED_NAME_MAPPING).forEach(([categoryId, expectedName]) => {
				it(`returns '${expectedName}' when categoryId is number ${categoryId}`, () => {
					expect(spEnhancementUtilities.getSpCategoryName(+categoryId)).toBe(expectedName);
				});

				it(`returns '${expectedName}' when categoryId is string ${categoryId}`, () => {
					expect(spEnhancementUtilities.getSpCategoryName(`${categoryId}`)).toBe(expectedName);
				});
			});
		});
	});
});
