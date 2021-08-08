const { getProcEffectToBuffMapping } = require('./proc-effect-mapping');
const { BuffId } = require('./buff-types');
const { createFactoryForBaseBuffFromArbitraryEffect, testFunctionExistence, testValidBuffIds, createArbitraryBaseEffect, createArbitraryContext, testMissingDamageFramesScenarios, expectNoParamsBuffWithEffectAndContext, testTurnDurationScenarios, testProcWithSingleNumericalParameterAndTurnDuration, testProcWithNumericalValueRangeAndChanceAndTurnDuration } = require('../../_test-helpers/proc-effect-mapping.utils');
const { ARBITRARY_HIT_COUNT, ARBITRARY_DAMAGE_DISTRIBUTION, HIT_DMG_DISTRIBUTION_TOTAL_KEY, ARBITRARY_TURN_DURATION, ELEMENT_MAPPING, AILMENT_MAPPING, EFFECT_DELAY_BUFF_PROP } = require('../../_test-helpers/constants');
const { Ailment } = require('../../datamine-types');

describe('getProcEffectBuffMapping method for default mapping', () => {
	const DEFAULT_TURN_DURATION_KEY = 'buff turns';
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

	describe('proc 4', () => {
		const expectedFlatFillId = 'proc:4:bc fill-flat';
		const expectedPercentFillId = 'proc:4:bc fill-percent';
		const FLAT_FILL_KEY = 'bb bc fill';
		const PERCENT_FILL_KEY = 'bb bc fill%';
		const expectedOriginalId = '4';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedFlatFillId, expectedPercentFillId]);

		it('uses the params property when it exists', () => {
			const params = '100,2';
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: expectedFlatFillId,
					value: 1,
				}),
				baseBuffFactory({
					id: expectedPercentFillId,
					value: 2,
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = '100,2,3,4,5';
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: expectedFlatFillId,
					value: 1,
				}),
				baseBuffFactory({
					id: expectedPercentFillId,
					value: 2,
				}),
				baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
					value: {
						param_2: '3',
						param_3: '4',
						param_4: '5',
					},
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[FLAT_FILL_KEY]: 3,
				[PERCENT_FILL_KEY]: 4,
			});
			const expectedResult = [
				baseBuffFactory({
					id: expectedFlatFillId,
					value: 3,
				}),
				baseBuffFactory({
					id: expectedPercentFillId,
					value: 4,
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('converts effect properties to numbers when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[FLAT_FILL_KEY]: '5',
				[PERCENT_FILL_KEY]: '6',
			});
			const expectedResult = [
				baseBuffFactory({
					id: expectedFlatFillId,
					value: 5,
				}),
				baseBuffFactory({
					id: expectedPercentFillId,
					value: 6,
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when values are missing', () => {
			it('defaults to 0 for missing flat fill value', () => {
				const effect = createArbitraryBaseEffect({
					[PERCENT_FILL_KEY]: 123,
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedPercentFillId,
						value: 123,
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('defaults to 0 for missing percent fill value', () => {
				const effect = createArbitraryBaseEffect({
					[FLAT_FILL_KEY]: 123,
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatFillId,
						value: 123,
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff when no parameters are given', () => {
				const effect = createArbitraryBaseEffect();
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});

			it('defaults all effect properties to 0 for non-number values', () => {
				const effect = createArbitraryBaseEffect({
					[FLAT_FILL_KEY]: 'not a number',
					[PERCENT_FILL_KEY]: 'not a number',
				});
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});
		});
	});

	describe('proc 5', () => {
		const STAT_PARAMS_ORDER = ['atk', 'def', 'rec', 'crit'];
		const ELEMENT_BUFFED_KEY = 'element buffed';
		const expectedOriginalId = '5';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `proc:5:regular or elemental-${stat}`));

		it('uses the params property when it exists', () => {
			const params = `0,1,2,3,4,${ARBITRARY_TURN_DURATION}`;
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
				return baseBuffFactory({
					id: `proc:5:regular or elemental-${stat}`,
					duration: ARBITRARY_TURN_DURATION,
					value: +splitParams[index + 1],
				});
			});

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = `5,1,2,3,4,${ARBITRARY_TURN_DURATION},7,8,9`;
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
				return baseBuffFactory({
					id: `proc:5:regular or elemental-${stat}`,
					duration: ARBITRARY_TURN_DURATION,
					value: +splitParams[index + 1],
					conditions: {
						targetElements: ['light'],
					},
				});
			}).concat([baseBuffFactory({
				id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
				value: {
					param_6: '7',
					param_7: '8',
					param_8: '9',
				},
			})]);

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[ELEMENT_BUFFED_KEY]: 'arbitrary element', // element is taken at face value
				'atk% buff (1)': 6, // the numbers here are from actual data; separate unit tests handle more arbitrary cases
				'def% buff (3)': 7,
				'rec% buff (5)': 8,
				'crit% buff (7)': 9,
				[DEFAULT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
			});
			const expectedParamValues = [6, 7, 8, 9];
			const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
				return baseBuffFactory({
					id: `proc:5:regular or elemental-${stat}`,
					duration: ARBITRARY_TURN_DURATION,
					value: expectedParamValues[index],
					conditions: {
						targetElements: ['arbitrary element'],
					},
				});
			});

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		STAT_PARAMS_ORDER.forEach((statCase) => {
			Object.entries(ELEMENT_MAPPING).forEach(([elementKey, elementValue]) => {
				it(`returns only value for ${statCase} and ${elementValue} if it is non-zero and other stats are zero and only one element is specified`, () => {
					const params = [elementKey, ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0'), ARBITRARY_TURN_DURATION].join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: `proc:5:regular or elemental-${statCase}`,
						duration: ARBITRARY_TURN_DURATION,
						value: 123,
					})];
					if (elementKey !== '0') {
						expectedResult[0].conditions = {
							targetElements: [elementValue],
						};
					}

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it(`converts element values with no mapping to "unknown" and the only non-zero stat is ${statCase}`, () => {
				const params = ['123', ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0'), ARBITRARY_TURN_DURATION].join(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: `proc:5:regular or elemental-${statCase}`,
					duration: ARBITRARY_TURN_DURATION,
					value: 123,
					conditions: {
						targetElements: ['unknown'],
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it(`parses ${statCase} buff in effect when params property does not exist`, () => {
				const effect = createArbitraryBaseEffect({
					[ELEMENT_BUFFED_KEY]: 'all',
					[`${statCase}% buff (${Math.floor(Math.random() * 100)})`]: 456,
					[DEFAULT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
				});
				const expectedResult = [baseBuffFactory({
					id: `proc:5:regular or elemental-${statCase}`,
					duration: ARBITRARY_TURN_DURATION,
					value: 456,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});
		});

		it('parses all element buff in effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[ELEMENT_BUFFED_KEY]: 'all',
				'atk% buff': 1,
				[DEFAULT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
			});
			const expectedResult = [baseBuffFactory({
				id: 'proc:5:regular or elemental-atk',
				duration: ARBITRARY_TURN_DURATION,
				value: 1,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('parses lack of element buff property to "unknown" in effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				'def% buff': 1,
				[DEFAULT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
			});
			const expectedResult = [baseBuffFactory({
				id: 'proc:5:regular or elemental-def',
				duration: ARBITRARY_TURN_DURATION,
				value: 1,
				conditions: {
					targetElements: ['unknown'],
				},
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when all stats are 0', () => {
			testTurnDurationScenarios({
				getMappingFunction: () => mappingFunction,
				getBaseBuffFactory: () => baseBuffFactory,
				createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,${duration}`,
				buffIdsInTurnDurationBuff: STAT_PARAMS_ORDER.map((stat) => `proc:5:regular or elemental-${stat}`),
			});
		});
	});

	describe('proc 6', () => {
		const effectKeyMapping = {
			bc: 'bc drop rate% buff (10)',
			hc: 'hc drop rate% buff (9)',
			item: 'item drop rate% buff (11)',
			turnDuration: 'drop buff rate turns',
		};
		const DROP_PARAMS_ORDER = ['bc', 'hc', 'item'];
		const expectedOriginalId = '6';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds(DROP_PARAMS_ORDER.map((p) => `proc:6:drop boost-${p}`));

		it('uses the params property when it exists', () => {
			const params = `1,2,3,${ARBITRARY_TURN_DURATION}`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: 'proc:6:drop boost-bc',
					duration: ARBITRARY_TURN_DURATION,
					value: 1,
				}),
				baseBuffFactory({
					id: 'proc:6:drop boost-hc',
					duration: ARBITRARY_TURN_DURATION,
					value: 2,
				}),
				baseBuffFactory({
					id: 'proc:6:drop boost-item',
					duration: ARBITRARY_TURN_DURATION,
					value: 3,
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = `1,2,3,${ARBITRARY_TURN_DURATION},5,6,7`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: 'proc:6:drop boost-bc',
					duration: ARBITRARY_TURN_DURATION,
					value: 1,
				}),
				baseBuffFactory({
					id: 'proc:6:drop boost-hc',
					duration: ARBITRARY_TURN_DURATION,
					value: 2,
				}),
				baseBuffFactory({
					id: 'proc:6:drop boost-item',
					duration: ARBITRARY_TURN_DURATION,
					value: 3,
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
				[effectKeyMapping.bc]: 4,
				[effectKeyMapping.hc]: 5,
				[effectKeyMapping.item]: 6,
				[effectKeyMapping.turnDuration]: ARBITRARY_TURN_DURATION,
			});
			const expectedResult = [
				baseBuffFactory({
					id: 'proc:6:drop boost-bc',
					duration: ARBITRARY_TURN_DURATION,
					value: 4,
				}),
				baseBuffFactory({
					id: 'proc:6:drop boost-hc',
					duration: ARBITRARY_TURN_DURATION,
					value: 5,
				}),
				baseBuffFactory({
					id: 'proc:6:drop boost-item',
					duration: ARBITRARY_TURN_DURATION,
					value: 6,
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('converts effect properties to numbers when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[effectKeyMapping.bc]: '7',
				[effectKeyMapping.hc]: '8',
				[effectKeyMapping.item]: '9',
				[effectKeyMapping.turnDuration]: `${ARBITRARY_TURN_DURATION}`,
			});
			const expectedResult = [
				baseBuffFactory({
					id: 'proc:6:drop boost-bc',
					duration: ARBITRARY_TURN_DURATION,
					value: 7,
				}),
				baseBuffFactory({
					id: 'proc:6:drop boost-hc',
					duration: ARBITRARY_TURN_DURATION,
					value: 8,
				}),
				baseBuffFactory({
					id: 'proc:6:drop boost-item',
					duration: ARBITRARY_TURN_DURATION,
					value: 9,
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when values are missing', () => {
			Object.entries(effectKeyMapping)
				.filter(([resultKey]) => resultKey !== 'turnDuration')
				.forEach(([resultKey, effectKey]) => {
					it(`returns only value for ${resultKey} if it is non-zero and other rates are zero in the params property`, () => {
						const params = [...DROP_PARAMS_ORDER.map((param) => param === resultKey ? '123' : '0'), ARBITRARY_TURN_DURATION].join(',');
						const effect = createArbitraryBaseEffect({ params });
						const expectedResult = [baseBuffFactory({
							id: `proc:6:drop boost-${resultKey}`,
							duration: ARBITRARY_TURN_DURATION,
							value: 123,
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});

					it(`returns only value for ${resultKey} if it is non-zero and other rates are zero when params property does not exist`, () => {
						const effect = createArbitraryBaseEffect({
							[effectKey]: 123,
							[effectKeyMapping.turnDuration]: ARBITRARY_TURN_DURATION,
						});
						const expectedResult = [baseBuffFactory({
							id: `proc:6:drop boost-${resultKey}`,
							duration: ARBITRARY_TURN_DURATION,
							value: 123,
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

			it('returns a no params buff if the effect params are non-number or missing', () => {
				const effect = createArbitraryBaseEffect({ params: 'non-number' });
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});
		});

		describe('when all rates are 0', () => {
			testTurnDurationScenarios({
				getMappingFunction: () => mappingFunction,
				getBaseBuffFactory: () => baseBuffFactory,
				createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,${duration}`,
				buffIdsInTurnDurationBuff: DROP_PARAMS_ORDER.map((p) => `proc:6:drop boost-${p}`),
			});
		});
	});

	describe('proc 7', () => {
		const AI_EFFECT_KEY = 'angel idol recover hp%';
		const expectedBuffId = 'proc:7:guaranteed ko resistance';
		const expectedOriginalId = '7';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffId]);

		it('uses the params property when it exists', () => {
			const effect = createArbitraryBaseEffect({ params: '1' });
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: 1,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const effect = createArbitraryBaseEffect({ params: '1,2,3,4' });
			const expectedResult = [
				baseBuffFactory({
					id: expectedBuffId,
					value: 1,
				}),
				baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
					value: {
						param_1: '2',
						param_2: '3',
						param_3: '4',
					},
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({ [AI_EFFECT_KEY]: 1234 });
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: 1234,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('converts effect properties to numbers when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({ [AI_EFFECT_KEY]: '5678' });
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: 5678,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff value when params value is 0', () => {
			const effect = createArbitraryBaseEffect({ params: '0' });
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: 0,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff value when params property and AI property on effect do not exist', () => {
			const effect = createArbitraryBaseEffect();
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: 0,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});
	});

	describe('proc 8', () => {
		const expectedFlatFillId = 'proc:8:max hp boost-flat';
		const expectedPercentFillId = 'proc:8:max hp boost-percent';
		const FLAT_FILL_KEY = 'max hp increase';
		const PERCENT_FILL_KEY = 'max hp% increase';
		const expectedOriginalId = '8';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedFlatFillId, expectedPercentFillId]);

		it('uses the params property when it exists', () => {
			const params = '1,2';
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: expectedFlatFillId,
					value: 1,
				}),
				baseBuffFactory({
					id: expectedPercentFillId,
					value: 2,
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = '1,2,3,4,5';
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: expectedFlatFillId,
					value: 1,
				}),
				baseBuffFactory({
					id: expectedPercentFillId,
					value: 2,
				}),
				baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
					value: {
						param_2: '3',
						param_3: '4',
						param_4: '5',
					},
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[FLAT_FILL_KEY]: 3,
				[PERCENT_FILL_KEY]: 4,
			});
			const expectedResult = [
				baseBuffFactory({
					id: expectedFlatFillId,
					value: 3,
				}),
				baseBuffFactory({
					id: expectedPercentFillId,
					value: 4,
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('converts effect properties to numbers when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[FLAT_FILL_KEY]: '5',
				[PERCENT_FILL_KEY]: '6',
			});
			const expectedResult = [
				baseBuffFactory({
					id: expectedFlatFillId,
					value: 5,
				}),
				baseBuffFactory({
					id: expectedPercentFillId,
					value: 6,
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when values are missing', () => {
			it('defaults to 0 for missing flat fill value', () => {
				const effect = createArbitraryBaseEffect({
					[PERCENT_FILL_KEY]: 123,
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedPercentFillId,
						value: 123,
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('defaults to 0 for missing percent fill value', () => {
				const effect = createArbitraryBaseEffect({
					[FLAT_FILL_KEY]: 123,
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatFillId,
						value: 123,
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff when no parameters are given', () => {
				const effect = createArbitraryBaseEffect();
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});

			it('defaults all effect properties to 0 for non-number values', () => {
				const effect = createArbitraryBaseEffect({
					[FLAT_FILL_KEY]: 'not a number',
					[PERCENT_FILL_KEY]: 'not a number',
				});
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});
		});
	});

	describe('proc 9', () => {
		const STAT_PARAMS_ORDER = ['atk', 'def', 'rec'];
		const STAT_PARAM_MAPPING = {
			atk: 1,
			def: 2,
			rec: 3,
		};

		const ELEMENT_BUFFED_KEY = 'element buffed';
		const PROC_CHANCE_KEY = 'proc chance%';
		const expectedOriginalId = '9';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `proc:9:regular or elemental reduction-${stat}`));

		it('uses the params property when it exists', () => {
			const params = `0,1,2,3,2,4,5,${ARBITRARY_TURN_DURATION}`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: 'proc:9:regular or elemental reduction-atk',
					duration: ARBITRARY_TURN_DURATION,
					value: {
						value: 2,
						chance: 3,
					},
				}),
				baseBuffFactory({
					id: 'proc:9:regular or elemental reduction-def',
					duration: ARBITRARY_TURN_DURATION,
					value: {
						value: 4,
						chance: 5,
					},
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = `1,2,3,4,3,5,6,${ARBITRARY_TURN_DURATION},9,10,11`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: 'proc:9:regular or elemental reduction-def',
					duration: ARBITRARY_TURN_DURATION,
					value: {
						value: 3,
						chance: 4,
					},
					conditions: {
						targetElements: ['fire'],
					},
				}),
				baseBuffFactory({
					id: 'proc:9:regular or elemental reduction-rec',
					duration: ARBITRARY_TURN_DURATION,
					value: {
						value: 5,
						chance: 6,
					},
					conditions: {
						targetElements: ['fire'],
					},
				}),
				baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
					value: {
						param_8: '9',
						param_9: '10',
						param_10: '11',
					},
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				'buff #1': {
					'atk% buff (2)': 6, // the numbers here are from actual data; separate unit tests handle more arbitrary cases
					'def% buff (4)': 7,
					'rec% buff (6)': 8,
					[PROC_CHANCE_KEY]: 9,
				},
				'buff #2': {
					'atk% buff (1)': 10,
					'def% buff (3)': 11,
					'rec% buff (5)': 12,
					[PROC_CHANCE_KEY]: 13,
				},
				[ELEMENT_BUFFED_KEY]: 'arbitrary element', // element is taken at face value
				[DEFAULT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
			});
			const expectedParamValues1 = [6, 7, 8];
			const expectedParamValues2 = [10, 11, 12];
			const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
				return baseBuffFactory({
					id: `proc:9:regular or elemental reduction-${stat}`,
					duration: ARBITRARY_TURN_DURATION,
					value: {
						value: expectedParamValues1[index],
						chance: 9,
					},
					conditions: {
						targetElements: ['arbitrary element'],
					},
				});
			}).concat(STAT_PARAMS_ORDER.map((stat, index) => {
				return baseBuffFactory({
					id: `proc:9:regular or elemental reduction-${stat}`,
					duration: ARBITRARY_TURN_DURATION,
					value: {
						value: expectedParamValues2[index],
						chance: 13,
					},
					conditions: {
						targetElements: ['arbitrary element'],
					},
				});
			}));

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		STAT_PARAMS_ORDER.forEach((statCase) => {
			Object.entries(ELEMENT_MAPPING).forEach(([elementKey, elementValue]) => {
				it(`returns only value for ${statCase}`, () => {
					const params = [elementKey, STAT_PARAM_MAPPING[statCase], 123, 456, 0, 0, 0, ARBITRARY_TURN_DURATION].join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: `proc:9:regular or elemental reduction-${statCase}`,
						duration: ARBITRARY_TURN_DURATION,
						value: {
							value: 123,
							chance: 456,
						},
					})];
					if (elementKey !== '0') {
						expectedResult[0].conditions = {
							targetElements: [elementValue],
						};
					}

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it(`converts element values with no mapping to "unknown" and the affected stat is ${statCase}`, () => {
				const params = ['123', STAT_PARAM_MAPPING[statCase], 123, 456, 0, 0, 0, ARBITRARY_TURN_DURATION].join(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: `proc:9:regular or elemental reduction-${statCase}`,
					duration: ARBITRARY_TURN_DURATION,
					value: {
						value: 123,
						chance: 456,
					},
					conditions: {
						targetElements: ['unknown'],
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			['buff #1', 'buff #2'].forEach((effectBuffProperty) => {
				it(`parses ${statCase} buff in effect's "${effectBuffProperty}" when params property does not exist`, () => {
					const effect = createArbitraryBaseEffect({
						[ELEMENT_BUFFED_KEY]: 'all',
						[effectBuffProperty]: {
							[`${statCase}% buff (${Math.floor(Math.random() * 100)})`]: 456,
							[PROC_CHANCE_KEY]: 789,
						},
						[DEFAULT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
					});
					const expectedResult = [baseBuffFactory({
						id: `proc:9:regular or elemental reduction-${statCase}`,
						duration: ARBITRARY_TURN_DURATION,
						value: {
							value: 456,
							chance: 789,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});
		});

		it('parses all element buff in effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[ELEMENT_BUFFED_KEY]: 'all',
				'buff #1': {
					'atk% buff': 1,
					[PROC_CHANCE_KEY]: 2,
				},
				[DEFAULT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
			});
			const expectedResult = [baseBuffFactory({
				id: 'proc:9:regular or elemental reduction-atk',
				duration: ARBITRARY_TURN_DURATION,
				value: {
					value: 1,
					chance: 2,
				},
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('parses lack of element buff property to "unknown" in effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				'buff #1': {
					'def% buff': 1,
					[PROC_CHANCE_KEY]: 2,
				},
				[DEFAULT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
			});
			const expectedResult = [baseBuffFactory({
				id: 'proc:9:regular or elemental reduction-def',
				duration: ARBITRARY_TURN_DURATION,
				value: {
					value: 1,
					chance: 2,
				},
				conditions: {
					targetElements: ['unknown'],
				},
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('handles case where affected stat is all in params', () => {
			const params = [0, 4, 456, 789, 0, 0, 0, ARBITRARY_TURN_DURATION].join(',');
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = STAT_PARAMS_ORDER.map((stat) => {
				return baseBuffFactory({
					id: `proc:9:regular or elemental reduction-${stat}`,
					duration: ARBITRARY_TURN_DURATION,
					value: {
						value: 456,
						chance: 789,
					},
				});
			});

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('handles case where affected stat is unknown in params', () => {
			const params = [0, 123, 456, 789, 0, 0, 0, ARBITRARY_TURN_DURATION].join(',');
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [baseBuffFactory({
				id: 'proc:9:regular or elemental reduction-unknown',
				duration: ARBITRARY_TURN_DURATION,
				value: {
					value: 456,
					chance: 789,
				},
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when all stats are 0', () => {
			testTurnDurationScenarios({
				getMappingFunction: () => mappingFunction,
				getBaseBuffFactory: () => baseBuffFactory,
				createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,0,0,${duration}`,
				buffIdsInTurnDurationBuff: STAT_PARAMS_ORDER.map((stat) => `proc:9:regular or elemental reduction-${stat}`),
			});
		});
	});

	describe('proc 10', () => {
		const expectedOriginalId = '10';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds(Object.values(AILMENT_MAPPING).concat(['unknown']).map((a) => `proc:10:cleanse-${a}`));

		it('uses the params property when it exists', () => {
			const params = '1,2,3,4,5,6,7,8';
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = Object.values(AILMENT_MAPPING)
				.slice(0, 8)
				.map((ailment) => baseBuffFactory({
					id: `proc:10:cleanse-${ailment}`,
					value: true,
				}));

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = '1,2,3,4,5,6,7,8,9,10,11';
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = Object.values(AILMENT_MAPPING)
				.slice(0, 8)
				.map((ailment) => baseBuffFactory({
					id: `proc:10:cleanse-${ailment}`,
					value: true,
				})).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
					value: {
						param_8: '9',
						param_9: '10',
						param_10: '11',
					},
				})]);

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				'remove rec down': true,
			});
			const expectedResult = [baseBuffFactory({
				id: 'proc:10:cleanse-rec down',
				value: true,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		Object.entries(AILMENT_MAPPING).forEach(([ailmentKey, ailmentName]) => {
			it(`returns an entry for ${ailmentName} when it is present in the params property`, () => {
				const params = [ailmentKey, '0,0,0,0,0,0,0'].join(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: `proc:10:cleanse-${ailmentName}`,
					value: true,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it(`returns an entry for ${ailmentName} when it is present in the effect and no params property does not exist`, () => {
				const effect = createArbitraryBaseEffect({ [`remove ${ailmentName}`]: true });
				const expectedResult = [baseBuffFactory({
					id: `proc:10:cleanse-${ailmentName}`,
					value: true,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});
		});

		it('parses multiple cleanse entries in effect when params property does not exist', () => {
			const valuesInEffect = Object.values(AILMENT_MAPPING).reduce((acc, ailment) => {
				acc[`remove ${ailment}`] = true;
				return acc;
			}, {});
			const effect = createArbitraryBaseEffect(valuesInEffect);
			const expectedResult = Object.values(AILMENT_MAPPING)
				.map((ailment) => baseBuffFactory({
					id: `proc:10:cleanse-${ailment}`,
					value: true,
				}));

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('parses params outside of the known ailments as unknown', () => {
			const params = '123,0,0,0,0,0,0,0';
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [baseBuffFactory({
				id: 'proc:10:cleanse-unknown',
				value: true,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('parses "remove all status ailments" property in effect as unknown when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({ 'remove all status ailments': true });
			const expectedResult = [baseBuffFactory({
				id: 'proc:10:cleanse-unknown',
				value: true,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a no params buff when no parameters are given', () => {
			const effect = createArbitraryBaseEffect();
			expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
		});

		it('returns a no params buff if all params are 0', () => {
			const params = new Array(8).fill('0').join(',');
			const effect = createArbitraryBaseEffect({ params });
			expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
		});
	});

	describe('proc 11', () => {
		const expectedOriginalId = '11';
		const AILMENT_EFFECT_KEY_MAPPING = {
			poison: 'poison%',
			weak: 'weaken%',
			sick: 'sick%',
			injury: 'injury%',
			curse: 'curse%',
			paralysis: 'paralysis%',
			'atk down': 'atk down',
			'def down': 'def down',
			'rec down': 'rec down',
		};

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds(Object.values(AILMENT_MAPPING).concat(['unknown']).map((a) => `proc:11:chance inflict-${a}`));

		it('uses the params property when it exists', () => {
			const params = '1,2';
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [baseBuffFactory({
				id: 'proc:11:chance inflict-poison',
				value: 2,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters when number of params is odd', () => {
			const params = '3,4,5,6,7';
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: 'proc:11:chance inflict-sick',
					value: 4,
				}),
				baseBuffFactory({
					id: 'proc:11:chance inflict-curse',
					value: 6,
				}),
				baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
					value: {
						param_4: '7',
					},
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('does not return a buff entry for extra parameters when number of params is odd and last parameter is 0', () => {
			const params = '4,5,6,7,0';
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: 'proc:11:chance inflict-injury',
					value: 5,
				}),
				baseBuffFactory({
					id: 'proc:11:chance inflict-paralysis',
					value: 7,
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				'paralysis%': 123,
			});
			const expectedResult = [baseBuffFactory({
				id: 'proc:11:chance inflict-paralysis',
				value: 123,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		Object.entries(AILMENT_MAPPING).forEach(([ailmentKey, ailmentName]) => {
			it(`returns an entry for ${ailmentName} when it is present in the params property`, () => {
				const params = `${ailmentKey},123`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: `proc:11:chance inflict-${ailmentName}`,
					value: 123,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it(`returns an entry for ${ailmentName} when it is present in the effect and no params property does not exist`, () => {
				const effect = createArbitraryBaseEffect({ [AILMENT_EFFECT_KEY_MAPPING[ailmentName]]: 456 });
				const expectedResult = [baseBuffFactory({
					id: `proc:11:chance inflict-${ailmentName}`,
					value: 456,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});
		});

		it('parses multiple inflict entries in effect when params property does not exist', () => {
			const valuesInEffect = Object.values(AILMENT_MAPPING).reduce((acc, ailment, index) => {
				acc[AILMENT_EFFECT_KEY_MAPPING[ailment]] = index + 1;
				return acc;
			}, {});
			const effect = createArbitraryBaseEffect(valuesInEffect);
			const expectedResult = Object.values(AILMENT_MAPPING)
				.map((ailment, index) => baseBuffFactory({
					id: `proc:11:chance inflict-${ailment}`,
					value: index + 1,
				}));

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('parses params outside of the known ailments as unknown', () => {
			const params = '123,456';
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [baseBuffFactory({
				id: 'proc:11:chance inflict-unknown',
				value: 456,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns values when no ailment is specified but chance is non-zero', () => {
			const params = '0,123';
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [baseBuffFactory({
				id: 'proc:11:chance inflict-unknown',
				value: 123,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a no params buff if all params are 0', () => {
			const params = new Array(8).fill('0').join(',');
			const effect = createArbitraryBaseEffect({ params });
			expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
		});
	});

	describe('proc 12', () => {
		const expectedBuffId = 'proc:12:guaranteed revive';
		const expectedOriginalId = '12';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffId]);

		it('uses the params property when it exists', () => {
			const effect = createArbitraryBaseEffect({ params: '123' });
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: 123,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const effect = createArbitraryBaseEffect({ params: '123,2,3,4' });
			const expectedResult = [
				baseBuffFactory({
					id: expectedBuffId,
					value: 123,
				}),
				baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
					value: {
						param_1: '2',
						param_2: '3',
						param_3: '4',
					},
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('falls back to stat-specific properties when the params property does not exist', () => {
			const effect = createArbitraryBaseEffect({ 'revive to hp%': 456 });
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: 456,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a value if parsed value from params is zero', () => {
			const effect = createArbitraryBaseEffect({ params: '0' });
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: 0,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});
	});

	describe('proc 13', () => {
		const PARAMS_ORDER = ['atk%', 'flatAtk', 'crit%', 'bc%', 'hc%', 'hits'];
		const expectedBuffId = 'proc:13:random attack';
		const expectedOriginalId = '13';
		const expectedTargetArea = 'random';

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
					distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
				targetArea: expectedTargetArea,
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
						distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
					},
					targetArea: expectedTargetArea,
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
				let key;
				if (stat === 'flatAtk') {
					key = 'bb flat atk';
				} else if (stat === 'hits') {
					key = stat;
				} else {
					key = `bb ${stat}`;
				}
				acc[key] = mockValues[index];
				return acc;
			}, {});
			const effect = createArbitraryBaseEffect(valuesInEffect);
			const context = createArbitraryContext({
				damageFrames: {
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
					distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
				targetArea: expectedTargetArea,
			})];

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		testMissingDamageFramesScenarios({
			getMappingFunction: () => mappingFunction,
			getBaseBuffFactory: () => baseBuffFactory,
			expectedBuffId,
			expectedTargetArea,
			testHits: false, // proc 13 does not get hit value from context
		});

		PARAMS_ORDER.forEach((paramCase) => {
			it(`returns only value for ${paramCase} if it is non-zero and other stats are zero`, () => {
				const params = PARAMS_ORDER.map((param) => param === paramCase ? '789' : '0').join(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						hits: 0,
						[paramCase]: 789,
						distribution: 0,
					},
					targetArea: expectedTargetArea,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});
		});
	});

	describe('proc 14', () => {
		const PARAMS_ORDER = ['atk%', 'flatAtk', 'crit%', 'bc%', 'hc%', 'dmg%', 'drainLow%', 'drainHigh%'];
		const expectedBuffId = 'proc:14:hp absorb attack';
		const expectedOriginalId = '14';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffId]);

		it('uses the params property when it exists', () => {
			const params = '1,2,3,4,5,6,7,8';
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
			const params = '1,2,3,4,5,6,7,8,9,10,11';
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
						param_8: '9',
						param_9: '10',
						param_10: '11',
					},
				}),
			];

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		it('falls back to effect properties when params property does not exist', () => {
			const mockValues = [7, 8, 9, 10, 11, 12, 13, 14];
			const valuesInEffect = PARAMS_ORDER.reduce((acc, stat, index) => {
				let key;
				if (stat === 'flatAtk') {
					key = 'bb flat atk';
				} else if (stat === 'drainLow%') {
					key = 'hp drain% low';
				} else if (stat === 'drainHigh%') {
					key = 'hp drain% high';
				} else {
					key = `bb ${stat}`;
				}
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

	describe('proc 16', () => {
		const expectedOriginalId = '16';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds(Object.values(ELEMENT_MAPPING).concat(['unknown']).map((element) => `proc:16:mitigate-${element}`));

		it('uses the params property when it exists', () => {
			const params = `0,1,${ARBITRARY_TURN_DURATION}`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [baseBuffFactory({
				id: 'proc:16:mitigate-all',
				duration: ARBITRARY_TURN_DURATION,
				value: 1,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = `1,2,${ARBITRARY_TURN_DURATION},4,5,6`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: 'proc:16:mitigate-fire',
					duration: ARBITRARY_TURN_DURATION,
					value: 2,
				}),
				baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
					value: {
						param_3: '4',
						param_4: '5',
						param_5: '6',
					},
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				'mitigate fire attacks (21)': 3, // number in key is from actual data; separate unit tests handle more arbitrary values
				[DEFAULT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
			});
			const expectedResult = [baseBuffFactory({
				id: 'proc:16:mitigate-fire',
				duration: ARBITRARY_TURN_DURATION,
				value: 3,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		Object.entries(ELEMENT_MAPPING).forEach(([elementKey, elementValue]) => {
			it(`parses value for ${elementValue}`, () => {
				const params = `${elementKey},123,${ARBITRARY_TURN_DURATION}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: `proc:16:mitigate-${elementValue}`,
					duration: ARBITRARY_TURN_DURATION,
					value: 123,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it(`parses value for ${elementValue} when params property does not exist`, () => {
				const effect = createArbitraryBaseEffect({
					[`mitigate ${elementValue} attacks (${Math.floor(Math.random() * 100)})`]: 456,
					[DEFAULT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
				});
				const expectedResult = [baseBuffFactory({
					id: `proc:16:mitigate-${elementValue}`,
					duration: ARBITRARY_TURN_DURATION,
					value: 456,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});
		});

		it('parses unknown elements to "unknown"', () => {
			const params = `1234,123,${ARBITRARY_TURN_DURATION}`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [baseBuffFactory({
				id: 'proc:16:mitigate-unknown',
				duration: ARBITRARY_TURN_DURATION,
				value: 123,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('parses unknown elements to "unknown" when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				'mitigate attacks': 456,
				[DEFAULT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
			});
			const expectedResult = [baseBuffFactory({
				id: 'proc:16:mitigate-unknown',
				duration: ARBITRARY_TURN_DURATION,
				value: 456,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when no mitigation value is given', () => {
			testTurnDurationScenarios({
				getMappingFunction: () => mappingFunction,
				getBaseBuffFactory: () => baseBuffFactory,
				createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,${duration}`,
				buffIdsInTurnDurationBuff: Object.values(ELEMENT_MAPPING).concat(['unknown']).map((stat) => `proc:16:mitigate-${stat}`),
			});

			it('returns a turn modification buff when turn duration is non-zero and params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					'attacks': 456,
					[DEFAULT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
				});
				const expectedResult = [baseBuffFactory({
					id: BuffId.TURN_DURATION_MODIFICATION,
					value: {
						buffs: Object.values(ELEMENT_MAPPING).concat(['unknown']).map((stat) => `proc:16:mitigate-${stat}`),
						duration: ARBITRARY_TURN_DURATION,
					},
				}, [EFFECT_DELAY_BUFF_PROP])];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});
		});
	});

	describe('proc 17', () => {
		const AILMENTS_ORDER = [Ailment.Poison, Ailment.Weak, Ailment.Sick, Ailment.Injury, Ailment.Curse, Ailment.Paralysis];
		const EFFECT_TURN_DURATION_KEY = 'resist status ails turns';
		const expectedOriginalId = '17';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds(AILMENTS_ORDER.map((ailment) => `proc:17:resist-${ailment}`));

		it('uses the params property when it exists', () => {
			const params = `1,2,3,4,5,6,${ARBITRARY_TURN_DURATION}`;
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
				return baseBuffFactory({
					id: `proc:17:resist-${ailment}`,
					duration: ARBITRARY_TURN_DURATION,
					value: +splitParams[index],
				});
			});

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = `1,2,3,4,5,6,${ARBITRARY_TURN_DURATION},8,9,10`;
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
				return baseBuffFactory({
					id: `proc:17:resist-${ailment}`,
					duration: ARBITRARY_TURN_DURATION,
					value: +splitParams[index],
				});
			}).concat([baseBuffFactory({
				id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
				value: {
					param_7: '8',
					param_8: '9',
					param_9: '10',
				},
			})]);

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				'resist poison% (30)': 7, // the numbers here are from actual data; separate unit tests handle more arbitrary cases
				'resist weaken% (31)': 8,
				'resist sick% (32)': 9,
				'resist injury% (33)': 10,
				'resist curse% (34)': 11,
				'resist paralysis% (35)': 12,
				[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
			});
			const expectedParamValues = [7, 8, 9, 10, 11, 12];
			const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
				return baseBuffFactory({
					id: `proc:17:resist-${ailment}`,
					duration: ARBITRARY_TURN_DURATION,
					value: expectedParamValues[index],
				});
			});

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		AILMENTS_ORDER.forEach((ailmentCase) => {
			it(`returns only value for ${ailmentCase} if it is non-zero and other stats are zero`, () => {
				const params = AILMENTS_ORDER.map((ailment) => ailment === ailmentCase ? '123' : '0').concat([ARBITRARY_TURN_DURATION]).join(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: `proc:17:resist-${ailmentCase}`,
					duration: ARBITRARY_TURN_DURATION,
					value: 123,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it(`returns only value for ${ailmentCase} if it is non-zero and other stats are zero and params property does not exist`, () => {
				const ailmentKey = ailmentCase !== Ailment.Weak ? ailmentCase : 'weaken';
				const effect = createArbitraryBaseEffect({
					[`resist ${ailmentKey}% (${Math.floor(Math.random() * 100)})`]: 123,
					[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
				});
				const expectedResult = [baseBuffFactory({
					id: `proc:17:resist-${ailmentCase}`,
					duration: ARBITRARY_TURN_DURATION,
					value: 123,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});
		});

		describe('when all resistances are 0', () => {
			testTurnDurationScenarios({
				getMappingFunction: () => mappingFunction,
				getBaseBuffFactory: () => baseBuffFactory,
				createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,0,${duration}`,
				buffIdsInTurnDurationBuff: AILMENTS_ORDER.map((ailment) => `proc:17:resist-${ailment}`),
			});
		});
	});

	describe('proc 18', () => {
		const expectedOriginalId = '18';
		testProcWithSingleNumericalParameterAndTurnDuration({
			getMappingFunction: () => getProcEffectToBuffMapping().get(expectedOriginalId),
			getBaseBuffFactory: () => createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId),
			expectedOriginalId,
			expectedBuffId: 'proc:18:mitigation',
			effectValueKey: 'dmg% reduction',
			effectTurnDurationKey: 'dmg% reduction turns (36)',
		});
	});

	describe('proc 19', () => {
		const expectedOriginalId = '19';
		testProcWithSingleNumericalParameterAndTurnDuration({
			getMappingFunction: () => getProcEffectToBuffMapping().get(expectedOriginalId),
			getBaseBuffFactory: () => createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId),
			expectedOriginalId,
			expectedBuffId: 'proc:19:gradual bc fill',
			effectValueKey: 'increase bb gauge gradual',
			effectTurnDurationKey: 'increase bb gauge gradual turns (37)',
			getExpectedValueFromParam: (param) => +param / 100,
		});
	});

	describe('proc 20', () => {
		const expectedOriginalId = '20';
		testProcWithNumericalValueRangeAndChanceAndTurnDuration({
			getMappingFunction: () => getProcEffectToBuffMapping().get(expectedOriginalId),
			getBaseBuffFactory: () => createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId),
			expectedOriginalId,
			expectedBuffId: 'proc:20:bc fill on hit',
			effectKeyLow: 'bc fill when attacked low',
			effectKeyHigh: 'bc fill when attacked high',
			effectKeyChance: 'bc fill when attacked%',
			effectTurnDurationKey: 'bc fill when attacked turns (38)',
			buffKeyLow: 'fillLow',
			buffKeyHigh: 'fillHigh',
			getExpectedValueFromParam: (param) => +param / 100,
			generateConditions: () => ({ whenAttacked: true }),
		});
	});

	describe('proc 22', () => {
		const expectedOriginalId = '22';
		testProcWithSingleNumericalParameterAndTurnDuration({
			getMappingFunction: () => getProcEffectToBuffMapping().get(expectedOriginalId),
			getBaseBuffFactory: () => createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId),
			expectedOriginalId,
			expectedBuffId: 'proc:22:defense ignore',
			effectValueKey: 'defense% ignore',
			effectTurnDurationKey: 'defense% ignore turns (39)',
		});
	});

	describe('proc 23', () => {
		const effectValueKey = 'spark dmg% buff (40)';
		const effectTurnDurationKey = DEFAULT_TURN_DURATION_KEY;
		const expectedBuffId = 'proc:23:spark damage';
		const expectedOriginalId = '23';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffId]);

		it('uses the params property when it exists', () => {
			const params = `1,0,0,0,0,0,${ARBITRARY_TURN_DURATION}`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				duration: ARBITRARY_TURN_DURATION,
				value: 1,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = `1,2,3,4,5,6,${ARBITRARY_TURN_DURATION},8,9,10`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: expectedBuffId,
					duration: ARBITRARY_TURN_DURATION,
					value: 1,
				}),
				baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
					value: {
						param_1: '2',
						param_2: '3',
						param_3: '4',
						param_4: '5',
						param_5: '6',
						param_7: '8',
						param_8: '9',
						param_9: '10',
					},
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra intermediate parameters', () => {
			const params = `1,2,3,4,5,6,${ARBITRARY_TURN_DURATION}`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: expectedBuffId,
					duration: ARBITRARY_TURN_DURATION,
					value: 1,
				}),
				baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
					value: {
						param_1: '2',
						param_2: '3',
						param_3: '4',
						param_4: '5',
						param_5: '6',
					},
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[effectValueKey]: 2,
				[effectTurnDurationKey]: ARBITRARY_TURN_DURATION,
			});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				duration: ARBITRARY_TURN_DURATION,
				value: 2,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('converts effect properties to numbers when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[effectValueKey]: '3',
				[effectTurnDurationKey]: ARBITRARY_TURN_DURATION,
			});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				duration: ARBITRARY_TURN_DURATION,
				value: 3,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when non-turn duration value is 0', () => {
			testTurnDurationScenarios({
				getMappingFunction: () => mappingFunction,
				getBaseBuffFactory: () => baseBuffFactory,
				createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,0,${duration}`,
				buffIdsInTurnDurationBuff: [expectedBuffId],
			});
		});
	});

	describe('proc 24', () => {
		const STAT_PARAMS_ORDER = ['atk', 'def', 'rec'];
		const CONVERTED_STAT_KEY = 'converted attribute';
		const EFFECT_TURN_DURATION_KEY = '% converted turns';
		const paramToResultStatMapping = {
			1: 'atk',
			2: 'def',
			3: 'rec',
			4: 'hp',
		};
		const effectStatToResultStatMapping = {
			attack: 'atk',
			defense: 'def',
			recovery: 'rec',
			hp: 'hp',
		};
		const expectedOriginalId = '24';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `proc:24:converted-${stat}`));

		it('uses the params property when it exists', () => {
			const params = `1,2,3,4,${ARBITRARY_TURN_DURATION}`;
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
				return baseBuffFactory({
					id: `proc:24:converted-${stat}`,
					duration: ARBITRARY_TURN_DURATION,
					value: {
						convertedStat: 'atk',
						value: +splitParams[index + 1],
					},
				});
			});

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = `2,2,3,4,${ARBITRARY_TURN_DURATION},6,7,8`;
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
				return baseBuffFactory({
					id: `proc:24:converted-${stat}`,
					duration: ARBITRARY_TURN_DURATION,
					value: {
						convertedStat: 'def',
						value: +splitParams[index + 1],
					},
				});
			}).concat([baseBuffFactory({
				id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
				value: {
					param_5: '6',
					param_6: '7',
					param_7: '8',
				},
			})]);

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[CONVERTED_STAT_KEY]: 'recovery',
				'atk% buff (46)': 4, // the numbers here are from actual data; separate unit tests handle more arbitrary cases
				'def% buff (47)': 5,
				'rec% buff (48)': 6,
				[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
			});
			const expectedParamValues = [4, 5, 6];
			const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
				return baseBuffFactory({
					id: `proc:24:converted-${stat}`,
					duration: ARBITRARY_TURN_DURATION,
					value: {
						value: expectedParamValues[index],
						convertedStat: 'rec',
					},
				});
			});

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		STAT_PARAMS_ORDER.forEach((statCase) => {
			Object.entries(paramToResultStatMapping).forEach(([convertedStatKey, convertedStatValue]) => {
				it(`returns only value for ${statCase} converted from ${convertedStatValue} if it is non-zero and other stats are zero and converted stat is ${convertedStatValue}`, () => {
					const params = [convertedStatKey, ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0'), ARBITRARY_TURN_DURATION].join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: `proc:24:converted-${statCase}`,
						duration: ARBITRARY_TURN_DURATION,
						value: {
							convertedStat: convertedStatValue,
							value: 123,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			Object.entries(effectStatToResultStatMapping).forEach(([convertedStatKey, convertedStatValue]) => {
				it(`returns only value for ${statCase} converted from ${convertedStatValue} if it is non-zero and other stats are zero and converted stat is ${convertedStatValue} and params property does not exist`, () => {
					const effect = createArbitraryBaseEffect({
						[CONVERTED_STAT_KEY]: convertedStatKey,
						[`${statCase}% buff (${Math.floor(Math.random() * 100)})`]: 456,
						[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
					});
					const expectedResult = [baseBuffFactory({
						id: `proc:24:converted-${statCase}`,
						duration: ARBITRARY_TURN_DURATION,
						value: {
							convertedStat: convertedStatValue,
							value: 456,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it(`converts converted stat values with no mapping to "unknown" and the only non-zero stat is ${statCase}`, () => {
				const params = ['123', ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0'), ARBITRARY_TURN_DURATION].join(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: `proc:24:converted-${statCase}`,
					duration: ARBITRARY_TURN_DURATION,
					value: {
						convertedStat: 'unknown',
						value: 123,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it(`converts converted stat values with no mapping to "unknown" and the only non-zero stat is ${statCase} and params property does not exist`, () => {
				const effect = createArbitraryBaseEffect({
					[CONVERTED_STAT_KEY]: 'arbitrary stat',
					[`${statCase}% buff (${Math.floor(Math.random() * 100)})`]: 456,
					[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
				});
				const expectedResult = [baseBuffFactory({
					id: `proc:24:converted-${statCase}`,
					duration: ARBITRARY_TURN_DURATION,
					value: {
						convertedStat: 'unknown',
						value: 456,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});
		});

		it('parses lack of converted stat property to "unknown" in effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				'def% buff': 1,
				[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
			});
			const expectedResult = [baseBuffFactory({
				id: 'proc:24:converted-def',
				duration: ARBITRARY_TURN_DURATION,
				value: {
					convertedStat: 'unknown',
					value: 1,
				},
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when all stats are 0', () => {
			testTurnDurationScenarios({
				getMappingFunction: () => mappingFunction,
				getBaseBuffFactory: () => baseBuffFactory,
				createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,${duration}`,
				buffIdsInTurnDurationBuff: STAT_PARAMS_ORDER.map((stat) => `proc:24:converted-${stat}`),
			});
		});
	});
});
