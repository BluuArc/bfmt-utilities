const spEnhancementUtilities = require('../../src/sp-enhancements');
const { assertObjectHasOnlyKeys } = require('../helpers/utils');

describe('SP Enhancement utilities', () => {
	it('has expected API surface', () => {
		assertObjectHasOnlyKeys(spEnhancementUtilities, [
			'getEffectsForSpEnhancement',
			'getSpCategoryName',
			'spIndexToCode',
			'spCodeToIndex',
			'getSpEntryId',
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

	describe('spIndexToCode', () => {
		describe('for invalid values for index', () => {
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
					name: 'is a string',
					value: 'some string',
				},
				{
					name: 'is not an integer',
					value: 1.23,
				},
				{
					name: 'is less than 0',
					value: -1,
				},
				{
					name: 'is greater than 61',
					value: 62,
				},
			].forEach(testCase => {
				it(`returns an empty string if index ${testCase.name}`, () => {
					expect(spEnhancementUtilities.spIndexToCode(testCase.value)).toBe('');
				});
			});
		});

		[
			{
				range: 'between 0 and 25 inclusive',
				cases: [
					[0, 'A'],
					[9, 'J'],
					[25, 'Z'],
				],
			},
			{
				range: 'between 26 and 51 inclusive',
				cases: [
					[26, 'a'],
					[35, 'j'],
					[51, 'z'],
				],
			},
			{
				range: 'between 52 and 61 inclusive',
				cases: [
					[52, '0'],
					[57, '5'],
					[61, '9'],
				],
			},
		].forEach(({ range, cases }) => {
			describe(`when index is ${range}`, () => {
				cases.forEach(([value, expectedResult]) => {
					it(`returns ${expectedResult} for input ${value}`, () => {
						expect(spEnhancementUtilities.spIndexToCode(value)).toBe(expectedResult);
					});
				});
			});
		});
	});

	describe('spCodeToIndex', () => {
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
					expect(spEnhancementUtilities.spCodeToIndex(testCase.value)).toBe(-1);
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
						expect(spEnhancementUtilities.spCodeToIndex(value)).toBe(expectedResult);
					});
				});
			});
		});
	});

	describe('getSpEntryId', () => {
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
					expect(spEnhancementUtilities.getSpEntryId(testCase.value)).toBe(testCase.value);
				});
			});
		});

		it('returns the value after the @ character if it exists', () => {
			const input = 'some@value';
			expect(spEnhancementUtilities.getSpEntryId(input)).toBe('value');
		});

		it('returns the original value if there is no data after the @ character', () => {
			const input = 'some@';
			expect(spEnhancementUtilities.getSpEntryId(input)).toBe('some@');
		});

		it('returns the original value if there is no @ character', () => {
			const input = 'somevalue';
			expect(spEnhancementUtilities.getSpEntryId(input)).toBe(input);
		});
	});
});
