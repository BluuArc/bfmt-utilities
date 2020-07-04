const helpers = require('./_helpers');
const { generateNonArrayTestCases, generateNonObjectTestCases } = require('../../_test-helpers/dataFactories');
const { TargetType, TargetArea, SpPassiveType } = require('../../datamine-types');
const { BuffSource } = require('./buff-types');

describe('buff helper functions', () => {
	const arbitrarySource = 'arbitrary source';
	const arbitrarySourceId = 'arbitrary source id';

	describe('createSourceEntryFromContext method', () => {
		it('creates a source entry using the context\'s source and sourceId properties', () => {
			const expectedResult = `${arbitrarySource}-${arbitrarySourceId}`;
			const context = { source: arbitrarySource, sourceId: arbitrarySourceId };
			expect(helpers.createSourceEntryFromContext(context)).toBe(expectedResult);
		});
	});

	describe('createSourcesFromContext method', () => {
		it('returns an array with the source entry from the given context', () => {
			const context = { source: arbitrarySource, sourceId: arbitrarySourceId };
			const expectedResult = [`${arbitrarySource}-${arbitrarySourceId}`];
			expect(helpers.createSourcesFromContext(context))
				.toEqual(expectedResult);
		});

		it('returns a new array with the previous sources and the source from the current context at the beginning of the array', () => {
			const previousSources = ['source 3', 'source 2', 'source 1'];
			const context = {
				source: arbitrarySource,
				sourceId: arbitrarySourceId,
				previousSources,
			};
			const expectedResult = [`${arbitrarySource}-${arbitrarySourceId}`].concat(previousSources);

			const result = helpers.createSourcesFromContext(context);
			expect(result).toEqual(expectedResult);
			expect(result)
				.withContext('result should be new array instead of existing previousSources array')
				.not.toBe(previousSources);
			expect(previousSources.length)
				.withContext('previousSources should not be mutated')
				.toBe(3);
		});

		describe('for invalid inputs of previousSources', () => {
			generateNonArrayTestCases().forEach((testCase) => {
				it(`returns an array with only the source entry from the given context when previousSources ${testCase.desc}`, () => {
					const context = {
						source: arbitrarySource,
						sourceId: arbitrarySourceId,
						previousSources: testCase.value,
					};
					const expectedResult = [`${arbitrarySource}-${arbitrarySourceId}`];
					expect(helpers.createSourcesFromContext(context))
						.toEqual(expectedResult);
				});
			});
		});
	});

	describe('processExtraSkillConditions method', () => {
		const RESULT_PROPERTIES = ['units', 'items', 'sphereTypes', 'unknown'];

		describe('for invalid effect inputs', () => {
			generateNonObjectTestCases().forEach((testCase) => {
				it(`returns undefined when the effect parameter ${testCase.desc}`, () => {
					expect(helpers.processExtraSkillConditions(testCase.value))
						.toBeUndefined();
				});
			});

			generateNonArrayTestCases().forEach((testCase) => {
				it(`returns undefined when the condition parameter of the effect object ${testCase.desc}`, () => {
					const effect = { condition: testCase.value };
					expect(helpers.processExtraSkillConditions(effect))
						.toBeUndefined();
				});
			});
		});

		const nonUnknownTestCases = [
			{
				conditionProperty: 'sphere category required (raw)',
				resultProperty: 'sphereTypes',
				inputValue: 'arbitrary sphere category',
				expectedValue: ['arbitrary sphere category'],
			},
			{
				conditionProperty: 'item required',
				resultProperty: 'items',
				inputValue: ['arbitrary item id', 'other item id'],
				expectedValue: ['arbitrary item id', 'other item id'],
			},
			{
				conditionProperty: 'unit required',
				resultProperty: 'units',
				inputValue: [{ id: 'arbitrary unit id' }, { id: 'other unit id' }],
				expectedValue: ['arbitrary unit id', 'other unit id'],
			},
		];
		nonUnknownTestCases.forEach((testCase) => {
			it(`returns conditions for ${testCase.resultProperty}`, () => {
				const effect = {
					conditions: [
						{
							[testCase.conditionProperty]: testCase.inputValue,
						},
					],
				};

				const expectedResult = RESULT_PROPERTIES.reduce((acc, prop) => {
					acc[prop] = prop === testCase.resultProperty
						? testCase.expectedValue
						: []; // all other properties should be an empty array
					return acc;
				}, {});
				expect(helpers.processExtraSkillConditions(effect))
					.toEqual(expectedResult);
			});
		});

		describe('for conditions that are not unit, item, or sphere type', () => {
			it('returns conditions with the type_id and condition_id', () => {
				const effect = {
					conditions: [
						{
							type_id: 'some type id',
							condition_id: 'some condition id',
						},
					],
				};
				const expectedResult = RESULT_PROPERTIES.reduce((acc, prop) => {
					acc[prop] = prop === 'unknown'
						? ['type:some type id,condition:some condition id']
						: []; // all other properties should be an empty array
					return acc;
				}, {});

				expect(helpers.processExtraSkillConditions(effect))
					.toEqual(expectedResult);
			});

			it('defaults to index when type_id and condition_id are falsy', () => {
				const effect = {
					conditions: [
						{
							arbitrary: 'unknown condition',
						},
						['not a condition'],
					],
				};
				const expectedResult = RESULT_PROPERTIES.reduce((acc, prop) => {
					acc[prop] = prop === 'unknown'
						? ['type:0,condition:0', 'type:1,condition:1']
						: []; // all other properties should be an empty array
					return acc;
				}, {});

				expect(helpers.processExtraSkillConditions(effect))
					.toEqual(expectedResult);
			});
		});

		it('returns results without duplicate values', () => {
			const allCases = nonUnknownTestCases
				.concat([{
					conditionProperty: 'some non-sphere/unit/item property',
					resultProperty: 'unknown',
					inputValue: { type_id: 'some type id', condition_id: 'some condition id' },
					expectedValue: ['type:some type id,condition:some condition id'],
				}]);
			const conditions = allCases.concat(allCases)
				.map((testCase) => {
					let condition;
					if (testCase.resultProperty !== 'unknown') {
						const value = Array.isArray(testCase.inputValue)
							? testCase.inputValue.concat(testCase.inputValue)
							: testCase.inputValue;
						condition = { [testCase.conditionProperty]: value };
					} else {
						condition = { ...testCase.inputValue };
					}
					return condition;
				});
			const expectedResult = RESULT_PROPERTIES.reduce((acc, prop) => {
				acc[prop] = allCases.find((c) => c.resultProperty === prop).expectedValue;
				return acc;
			}, {});
			expect(helpers.processExtraSkillConditions({ conditions }))
				.toEqual(expectedResult);
		});
	});

	describe('getPassiveTargetData method', () => {
		const expectSelfSingleTargetData = (result) => {
			expect(result).toEqual({
				targetType: TargetType.Self,
				targetArea: TargetArea.Single,
			});
		};
		const expectPartyAoeTargetData = (result) => {
			expect(result).toEqual({
				targetType: TargetType.Party,
				targetArea: TargetArea.Aoe,
			});
		};

		[
			{
				name: 'context.source is leader skill',
				effect: {},
				context: { source: BuffSource.LeaderSkill },
			},
			{
				name: 'effect.sp_type is enhancing passive',
				effect: { sp_type: SpPassiveType.EnhancePassive },
				context: {},
			},
			{
				name: 'effect[\'passive target\'] is party',
				effect: { 'passive target': TargetType.Party },
				context: {},
			},
		].forEach((testCase) => {
			it(`returns party-oriented target data when ${testCase.name}`, () => {
				const result = helpers.getPassiveTargetData(testCase.effect, testCase.context);
				expectPartyAoeTargetData(result);
			});
		});

		[
			{
				name: 'for empty effect and contexts',
				effect: {},
				context: {},
			},
			{
				name: 'context.source is not leader skill',
				effect: {},
				context: { source: 'not leader skill' },
			},
			{
				name: 'effect.sp_type is not enhancing passive',
				effect: { sp_type: 'not enhance passive' },
				context: {},
			},
			{
				name: 'effect[\'passive target\'] is not party',
				effect: { 'passive target': 'not party' },
				context: {},
			},
		].forEach((testCase) => {
			it(`returns self-oriented target data when ${testCase.name}`, () => {
				const result = helpers.getPassiveTargetData(testCase.effect, testCase.context);
				expectSelfSingleTargetData(result);
			});
		});
	});
});
