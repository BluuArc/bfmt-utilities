const unitUtilities = require('../../src/units');
const { assertObjectHasOnlyKeys } = require('../helpers/utils');

describe('unit utilities', () => {
	it('has expected API surface', () => {
		const expectedSurface = [
			'getUnitImageFileNames',
			'getUnitImageUrl',
		].sort();
		assertObjectHasOnlyKeys(unitUtilities, expectedSurface);
	});

	describe('getUnitImageFileNames method', () => {
		const EXPECTED_RESULT_SURFACE = ['spritesheet', 'battleAvatar', 'guideAvatar', 'fullIllustration'];
		const testCases = [
			{
				name: 'is null',
				value: null,
				expectedValueForParameter: '',
			},
			{
				name: 'is undefined',
				value: void 0,
				expectedValueForParameter: '',
			},
			{
				name: 'is a string',
				value: 'some string',
				expectedValueForParameter: 'some string',
			},
		];

		testCases.forEach(idTestCase => {
			testCases.forEach(suffixTestCase => {
				it(`returns expected values when id ${idTestCase.name} and suffix ${suffixTestCase.value}`, () => {
					const expectedSuffix = `${idTestCase.expectedValueForParameter}${suffixTestCase.expectedValueForParameter}.png`;
					const result = unitUtilities.getUnitImageFileNames(idTestCase.value, suffixTestCase.value);
					expect(typeof result === 'object')
						.withContext('result is not an object')
						.toBe(true);
					assertObjectHasOnlyKeys(result, EXPECTED_RESULT_SURFACE, 'result does not have expected properties');
					expect(result.spritesheet)
						.withContext('spritesheet property mismatch')
						.toBe(`unit_anime_${expectedSuffix}`);
					expect(result.battleAvatar)
						.withContext('battleAvatar property mismatch')
						.toBe(`unit_ills_battle_${expectedSuffix}`);
					expect(result.guideAvatar)
						.withContext('guideAvatar property mismatch')
						.toBe(`unit_ills_thum_${expectedSuffix}`);
					expect(result.fullIllustration)
						.withContext('fullIllustration property mismatch')
						.toBe(`unit_ills_full_${expectedSuffix}`);
				});
			});
		});
	});

	describe('getUnitImageUrl method', () => {
		const testCases = [
			{
				name: 'is null',
				value: null,
				expectedValueForParameter: '',
			},
			{
				name: 'is undefined',
				value: void 0,
				expectedValueForParameter: '',
			},
			{
				name: 'is a string',
				value: 'some string',
				expectedValueForParameter: 'some string',
			},
		];

		testCases.forEach(baseContentUrlTestCase => {
			testCases.forEach(filenameTestCase => {
				it(`returns expected string when baseContentUrl ${baseContentUrlTestCase.name} and filename ${filenameTestCase.name}"`, () => {
					const expectedResult = `${baseContentUrlTestCase.expectedValueForParameter}/unit/img/${filenameTestCase.expectedValueForParameter}`;
					expect(unitUtilities.getUnitImageUrl(baseContentUrlTestCase.value, filenameTestCase.value)).toBe(expectedResult);
				});
			});
		});
	});
});
