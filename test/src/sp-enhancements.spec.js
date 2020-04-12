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
			'getSpEntryWithId',
			'getAllDependenciesForSpEntry',
			'getAllEntriesThatDependOnSpEntry',
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

	describe('spIndexToCode method', () => {
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

	describe('spCodeToIndex method', () => {
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

	describe('getSpEntryId method', () => {
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

	describe('getSpEntryWithId method', () => {
		describe('for invalid inputs', () => {
			const invalidIdCases = [
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
			];

			const invalidSpArrayCases = [
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
					name: 'is an object that is not an array',
					value: { some: 'property' },
				},
				{
					name: 'is an array of non-objects',
					value: [undefined, null, 0, 'some string'],
				},
				{
					name: 'is an array of objects without an ID property',
					value: [{ some: 'property' }, { some: 'other property'}],
				},
			];
			invalidIdCases.forEach(idCase => {
				invalidSpArrayCases.forEach(spCase => {
					it(`returns undefined when id ${idCase.name} and entries ${spCase.name}`, () => {
						expect(spEnhancementUtilities.getSpEntryWithId(idCase.value, spCase.value)).toBe(void 0);
					});
				});
			});
		});

		it('returns undefined when entries is empty', () => {
			expect(spEnhancementUtilities.getSpEntryWithId('1', [])).toBe(undefined);
		});

		it('returns undefined when there are no entries with a matching ID', () => {
			const id = '1';
			const entries = [{ id: '2' }, { id: '3' }];
			const result = spEnhancementUtilities.getSpEntryWithId(id, entries);
			expect(result).toBe(undefined);
		});

		describe('cases when entries should be found', () => {
			it('returns the first entry that matches a given ID', () => {
				const id = '12345';
				const entries = [{ id: 'something else' }, { id }, { id }];
				const result = spEnhancementUtilities.getSpEntryWithId(id, entries);
				expect(entries.indexOf(result))
					.withContext('result was not first entry with matching ID')
					.toBe(1);
			});

			[
				['12345', '12345', 'the non-@ version of SP entry IDs when both the ID and entries do not use @'],
				['1@2345', '2345', 'the @ version of SP entry IDs when the ID uses @ and entries do not'],
				['2345', '1@2345', 'the @ version of SP entry IDs when the ID does not use @ and entries do use @'],
				['1@2345', '1@2345', 'the @ version of SP entry IDs when both the ID and entries use @'],
			].forEach(([inputId, entriesId, name]) => {
				it(`correctly processes ${name}`, () => {
					const entries = [{ id: entriesId }];
					const result = spEnhancementUtilities.getSpEntryWithId(inputId, entries);
					expect(result)
						.withContext('result was not first entry with matching ID')
						.toBe(entries[0]);
				});
			});
		});
	});

	describe('getAllDependenciesForSpEntry method', () => {
		describe('for invalid inputs', () => {
			const invalidEntryCases = [
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
					name: 'is an object where obj.dependency does not exist',
					value: { some: 'property' },
				},
			];

			const invalidEntriesCases = [
				{
					name: 'is null',
					value: null,
				},
				{
					name: 'is undefined',
					value: (void 0),
				},
				{
					name: 'is not an object',
					value: 'some value',
				},
				{
					name: 'is an object but not an array',
					value: { some: 'value' },
				},
				{
					name: 'is not an array of objects with an ID property',
					value: ['some string', 123, void 0, null, [], { some: 'value' }],
				},
			];

			invalidEntryCases.forEach(entryCase => {
				invalidEntriesCases.forEach(allEntriesCase => {
					it(`returns an empty array when entry ${entryCase.name} and allEntries ${allEntriesCase.name}`, () => {
						const result = spEnhancementUtilities.getAllDependenciesForSpEntry(entryCase.value, allEntriesCase.value);
						expect(result).toEqual([]);
					});
				});
			});
		});

		it('returns an empty array if the dependent skill is not in the allEntries array', () => {
			const entry = { dependency: '123' };
			const allEntries = Array.from({ length: 10 }, (_, i) => ({ id: `${i}` }));
			const result = spEnhancementUtilities.getAllDependenciesForSpEntry(entry, allEntries);
			expect(result).toEqual([]);
		});

		it('returns an array with the corresponding entry that has the input entry\'s dependency ID', () => {
			const entry = { dependency: '1' };
			const allEntries = Array.from({ length: 10 }, (_, i) => ({ id: `${i}` }));
			const result = spEnhancementUtilities.getAllDependenciesForSpEntry(entry, allEntries);

			expect(result).toEqual([allEntries[1]]);
		});

		it('returns nested dependencies', () => {
			const entry = { dependency: '1' };
			const allEntries = [
				{
					id: '0',
				},
				{
					id: '1',
					dependency: '2',
				},
				{
					id: '2',
					dependency: '0',
				},
				{
					id: '3',
					dependency: '0',
				},
			];
			const result = spEnhancementUtilities.getAllDependenciesForSpEntry(entry, allEntries);

			expect(result).toEqual([
				allEntries[1],
				allEntries[2],
				allEntries[0],
			]);
		});

		it('only includes dependencies once (i.e. no circular dependencies)', () => {
			const entry = { dependency: '1' };
			const allEntries = [
				{
					id: '0',
					dependency: '1',
				},
				{
					id: '1',
					dependency: '0',
				},
			];
			const result = spEnhancementUtilities.getAllDependenciesForSpEntry(entry, allEntries);

			expect(result).toEqual([
				allEntries[1],
				allEntries[0],
			]);
		});
	});

	describe('getAllEntriesThatDependOnSpEntry method', () => {
		describe('for invalid inputs', () => {
			const invalidEntryCases = [
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
					name: 'is an object where obj.id does not exist',
					value: { some: 'property' },
				},
			];

			const invalidEntriesCases = [
				{
					name: 'is null',
					value: null,
				},
				{
					name: 'is undefined',
					value: (void 0),
				},
				{
					name: 'is not an object',
					value: 'some value',
				},
				{
					name: 'is an object but not an array',
					value: { some: 'value' },
				},
				{
					name: 'is not an array of objects with a dependency property',
					value: ['some string', 123, void 0, null, [], { some: 'value' }],
				},
			];

			invalidEntryCases.forEach(entryCase => {
				invalidEntriesCases.forEach(allEntriesCase => {
					it(`returns an empty array when entry ${entryCase.name} and allEntries ${allEntriesCase.name}`, () => {
						const result = spEnhancementUtilities.getAllEntriesThatDependOnSpEntry(entryCase.value, allEntriesCase.value);
						expect(result).toEqual([]);
					});
				});
			});
		});

		it('returns an empty array if the skill depending on it is not in the allEntries array', () => {
			const entry = { id: '123' };
			const allEntries = Array.from({ length: 10 }, (_, i) => ({ dependency: `${i}` }));
			const result = spEnhancementUtilities.getAllEntriesThatDependOnSpEntry(entry, allEntries);
			expect(result).toEqual([]);
		});

		it('returns an array with the corresponding entry that depends on the input entry', () => {
			const entry = { id: '1' };
			const allEntries = Array.from({ length: 10 }, (_, i) => ({ dependency: `${i}` }));
			const result = spEnhancementUtilities.getAllEntriesThatDependOnSpEntry(entry, allEntries);

			expect(result).toEqual([allEntries[1]]);
		});

		it('returns nested dependents', () => {
			const entry = { id: '5' };
			const allEntries = [
				{
					id: '0',
					dependency: '2',
				},
				{
					id: '1',
					dependency: '5',
				},
				{
					id: '2',
					dependency: '1',
				},
				{
					id: '3',
				},
			];
			const result = spEnhancementUtilities.getAllEntriesThatDependOnSpEntry(entry, allEntries);

			expect(result).toEqual([
				allEntries[1],
				allEntries[2],
				allEntries[0],
			]);
		});

		it('only includes dependents once (i.e. no circular dependents)', () => {
			const entry = { id: '1' };
			const allEntries = [
				{
					id: '0',
					dependency: '1',
				},
				{
					id: '1',
					dependency: '0',
				},
			];
			const result = spEnhancementUtilities.getAllEntriesThatDependOnSpEntry(entry, allEntries);

			expect(result).toEqual([
				allEntries[0],
				allEntries[1],
			]);
		});
	});
});
