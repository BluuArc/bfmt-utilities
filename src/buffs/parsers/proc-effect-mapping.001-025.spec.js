const { getProcEffectToBuffMapping } = require('./proc-effect-mapping');
const { BuffId } = require('./buff-types');
// const { UnitElement, Ailment, TargetArea, TargetType } = require('../../datamine-types');
const { createFactoryForBaseBuffFromArbitraryEffect, testFunctionExistence, testValidBuffIds, createArbitraryBaseEffect, createArbitraryContext, testMissingDamageFramesScenarios, expectNoParamsBuffWithEffectAndContext, testTurnDurationScenarios } = require('../../_test-helpers/proc-effect-mapping.utils');
const { ARBITRARY_HIT_COUNT, ARBITRARY_DAMAGE_DISTRIBUTION, HIT_DMG_DISTRIBUTION_TOTAL_KEY, ARBITRARY_TURN_DURATION } = require('../../_test-helpers/constants');

describe('getProcEffectBuffMapping method for default mapping', () => {
	/**
	 * @type {import('./proc-effect-mapping').ProcEffectToBuffFunction}
	 */
	let mappingFunction;
	/**
	 * @type {(params?: import('./buff-types').IBuff, propsToDelete?: string[]) => import('./buff-types').IBuff}
	 */
	let baseBuffFactory;

	describe('proc 1', () => {
		const PARAMS_ORDER = ['atk%', 'flatAtk', 'crit%', 'bc%', 'hc%', 'dmg%'];
		const expectedBuffId = 'proc:1:attack';
		const expectedOriginalId = '1';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffId]);

		it('uses the params property when it exists', () => {
			const params = '1,2,3,4,5,6';
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			});
			const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
				acc[param] = +splitParams[index];
				return acc;
			}, {});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: {
					...expectedValuesForParams,
					hits: ARBITRARY_HIT_COUNT,
					distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			})];

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = '1,2,3,4,5,6,7,8,9';
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			});
			const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
				acc[param] = +splitParams[index];
				return acc;
			}, {});
			const expectedResult = [
				baseBuffFactory({
					id: expectedBuffId,
					value: {
						...expectedValuesForParams,
						hits: ARBITRARY_HIT_COUNT,
						distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
					},
				}),
				baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
					value: {
						param_6: '7',
						param_7: '8',
						param_8: '9',
					},
				}),
			];

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		it('falls back to effect properties when params property does not exist', () => {
			const mockValues = [7, 8, 9, 10, 11, 12];
			const valuesInEffect = PARAMS_ORDER.reduce((acc, stat, index) => {
				const key = stat !== 'flatAtk'
					? `bb ${stat}`
					: 'bb flat atk';
				acc[key] = mockValues[index];
				return acc;
			}, {});
			const effect = createArbitraryBaseEffect(valuesInEffect);
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			});
			const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
				acc[param] = +mockValues[index];
				return acc;
			}, {});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: {
					...expectedValuesForParams,
					hits: ARBITRARY_HIT_COUNT,
					distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			})];

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		testMissingDamageFramesScenarios({ expectedBuffId, getMappingFunction: () => mappingFunction, getBaseBuffFactory: () => baseBuffFactory });

		PARAMS_ORDER.forEach((paramCase) => {
			it(`returns only value for ${paramCase} if it is non-zero and other stats are zero`, () => {
				const params = PARAMS_ORDER.map((param) => param === paramCase ? '789' : '0').join(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						[paramCase]: 789,
						hits: 0,
						distribution: 0,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});
		});
	});

	describe('proc 2', () => {
		const expectedBuffId = 'proc:2:burst heal';
		const expectedOriginalId = '2';

		const arbitraryRecX = 120;
		const arbitraryRecY = 25;
		const expectedRecAddedForArbitraryValues = 27.5;

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffId]);

		it('uses the params property when it exists', () => {
			const params = `1,2,${arbitraryRecX},${arbitraryRecY}`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: {
					healLow: 1,
					healHigh: 2,
					'healerRec%': expectedRecAddedForArbitraryValues,
				},
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = `1,2,${arbitraryRecX},${arbitraryRecY},5,6,7`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: expectedBuffId,
					value: {
						healLow: 1,
						healHigh: 2,
						'healerRec%': expectedRecAddedForArbitraryValues,
					},
				}),
				baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
					value: {
						param_4: '5',
						param_5: '6',
						param_6: '7',
					},
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				'heal low': 3,
				'heal high': 4,
				'rec added% (from healer)': 5,
			});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: {
					healLow: 3,
					healHigh: 4,
					'healerRec%': 5,
				},
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('converts effect properties to numbers when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				'heal low': '6',
				'heal high': '7',
				'rec added% (from healer)': '8',
			});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: {
					healLow: 6,
					healHigh: 7,
					'healerRec%': 8,
				},
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when values are missing', () => {
			const effectPropToResultPropMapping = {
				'heal low': 'healLow',
				'heal high': 'healHigh',
				'rec added% (from healer)': 'healerRec%',
			};
			Object.keys(effectPropToResultPropMapping).forEach((effectProp) => {
				it(`defaults to 0 for missing ${effectProp} value`, () => {
					const valuesInEffect = Object.keys(effectPropToResultPropMapping)
						.filter((prop) => prop !== effectProp)
						.reduce((acc, prop) => {
							acc[prop] = 123;
							return acc;
						}, {});
					const effect = createArbitraryBaseEffect(valuesInEffect);
					const expectedValues = Object.entries(effectPropToResultPropMapping)
						.reduce((acc, [localEffectProp, resultProp]) => {
							acc[resultProp] = localEffectProp === effectProp ? 0 : 123;
							return acc;
						}, {});
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: expectedValues,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('returns a no params buff when no parameters are given', () => {
				const effect = createArbitraryBaseEffect();
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});

			it('defaults all effect properties to 0 for non-number values', () => {
				const valuesInEffect = Object.keys(effectPropToResultPropMapping)
					.reduce((acc, prop) => {
						acc[prop] = 'not a number';
						return acc;
					}, {});
				const effect = createArbitraryBaseEffect(valuesInEffect);
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});

			it('defaults values for effect params to 0 if they are non-number or missing', () => {
				const effect = createArbitraryBaseEffect({ params: 'non-number' });
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});
		});
	});

	describe('proc 3', () => {
		const expectedBuffId = 'proc:3:gradual heal';
		const expectedOriginalId = '3';

		const arbitraryRecParam = 80;
		const expectedRecAddedForArbitraryValues = 18;

		const EFFECT_TURN_DURATION_KEY = 'gradual heal turns (8)';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffId]);

		it('uses the params property when it exists', () => {
			const params = `1,2,${arbitraryRecParam},${ARBITRARY_TURN_DURATION}`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				duration: ARBITRARY_TURN_DURATION,
				value: {
					healLow: 1,
					healHigh: 2,
					'targetRec%': expectedRecAddedForArbitraryValues,
				},
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = `1,2,${arbitraryRecParam},${ARBITRARY_TURN_DURATION},5,6,7`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: expectedBuffId,
					duration: ARBITRARY_TURN_DURATION,
					value: {
						healLow: 1,
						healHigh: 2,
						'targetRec%': expectedRecAddedForArbitraryValues,
					},
				}),
				baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
					value: {
						param_4: '5',
						param_5: '6',
						param_6: '7',
					},
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				'gradual heal low': 3,
				'gradual heal high': 4,
				'rec added% (from target)': 5,
				[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
			});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				duration: ARBITRARY_TURN_DURATION,
				value: {
					healLow: 3,
					healHigh: 4,
					'targetRec%': 5,
				},
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('converts effect properties to numbers when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				'gradual heal low': '6',
				'gradual heal high': '7',
				'rec added% (from target)': '8',
				[EFFECT_TURN_DURATION_KEY]: '9',
			});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				duration: 9,
				value: {
					healLow: 6,
					healHigh: 7,
					'targetRec%': 8,
				},
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when values are missing', () => {
			const effectPropToResultPropMapping = {
				'gradual heal low': 'healLow',
				'gradual heal high': 'healHigh',
				'rec added% (from target)': 'targetRec%',
			};
			Object.keys(effectPropToResultPropMapping).forEach((effectProp) => {
				it(`defaults to 0 for missing ${effectProp} value`, () => {
					const valuesInEffect = Object.keys(effectPropToResultPropMapping)
						.filter((prop) => prop !== effectProp)
						.reduce((acc, prop) => {
							acc[prop] = 123;
							return acc;
						}, {});
					const effect = createArbitraryBaseEffect({
						...valuesInEffect,
						[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
					});
					const expectedValues = Object.entries(effectPropToResultPropMapping)
						.reduce((acc, [localEffectProp, resultProp]) => {
							acc[resultProp] = localEffectProp === effectProp ? 0 : 123;
							return acc;
						}, {});
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: ARBITRARY_TURN_DURATION,
						value: expectedValues,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('returns a no params buff when all effect properties are non-number values', () => {
				const valuesInEffect = Object.keys(effectPropToResultPropMapping)
					.reduce((acc, prop) => {
						acc[prop] = 'not a number';
						return acc;
					}, {});
				const effect = createArbitraryBaseEffect({
					...valuesInEffect,
					[EFFECT_TURN_DURATION_KEY]: 'not a number',
				});
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});

			it('returns a no params buff when the effect params are non-number or missing', () => {
				const effect = createArbitraryBaseEffect({ params: 'non-number' });
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});
		});

		describe('when all stats are 0', () => {
			testTurnDurationScenarios({
				getMappingFunction: () => mappingFunction,
				getBaseBuffFactory: () => baseBuffFactory,
				createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,${duration}`,
				buffIdsInTurnDurationBuff: [expectedBuffId],
			});
		});
	});
});
