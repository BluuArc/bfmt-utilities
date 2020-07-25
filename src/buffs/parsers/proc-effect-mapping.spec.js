const { getProcEffectToBuffMapping } = require('./proc-effect-mapping');
const { BuffId } = require('./buff-types');
const { UnitElement } = require('../../datamine-types');

describe('getProcEffectToBuffMapping method', () => {
	it('uses the same mapping object on multiple calls', () => {
		const initialMapping = getProcEffectToBuffMapping();
		expect(initialMapping).toBeDefined();
		for (let i = 0; i < 5; ++i) {
			expect(getProcEffectToBuffMapping()).toBe(initialMapping);
		}
	});

	it('returns a new mapping object when the reload parameter is true', () => {
		const allMappings = new Set();
		const initialMapping = getProcEffectToBuffMapping();
		expect(initialMapping).toBeDefined();
		allMappings.add(initialMapping);
		for (let i = 0; i < 5; ++i) {
			const newMapping = getProcEffectToBuffMapping(true);
			expect(newMapping).toBeDefined();
			expect(allMappings.has(newMapping))
				.withContext('expect new mapping object to not be in set of previous mappings')
				.toBeFalse();
			allMappings.add(newMapping);
		}

		// should match number of times getProcEffectToBuffMapping was called in this test
		expect(allMappings.size)
			.withContext('expect number of mappings added to set to match number of times getProcEffectToBuffMapping was called')
			.toBe(6);
	});

	describe('for default mapping', () => {
		/**
			 * @type {import('./proc-effect-mapping').ProcEffectToBuffFunction}
			 */
		let mappingFunction;
		/**
		 * @type {(params?: import('./buff-types').IBuff, propsToDelete?: string[]) => import('./buff-types').IBuff}
		 */
		let baseBuffFactory;
		const arbitraryTargetData = { targetData: 'data' };
		const arbitrarySourceValue = ['some source value'];
		const arbitraryUnknownValue = { unknownValue: 'some unknown value' };
		const arbitraryEffectDelay = 'arbitrary effect delay';
		const arbitraryHitCount = 123;
		const arbitraryDamageDistribution = 456;
		const arbitraryTurnDuration = 789;

		const EFFECT_DELAY_KEY = 'effect delay time(ms)/frame';
		const HIT_DMG_DISTRIBUTION_TOTAL_KEY = 'hit dmg% distribution (total)';
		const BUFF_TARGET_PROPS = ['targetType', 'targetArea'];
		const EFFECT_DELAY_BUFF_PROP = 'effectDelay';

		const createDefaultInjectionContext = () => {
			/**
			 * @type {import('./_helpers').IProcBuffProcessingInjectionContext}
			 */
			const injectionContext = {
				getProcTargetData: jasmine.createSpy('getProcTargetDataSpy'),
				createSourcesFromContext: jasmine.createSpy('createSourcesFromContextSpy'),
				createUnknownParamsValue: jasmine.createSpy('createUnkownParamsValueSpy'),
			};
			injectionContext.getProcTargetData.and.returnValue(arbitraryTargetData);
			injectionContext.createSourcesFromContext.and.returnValue(arbitrarySourceValue);
			injectionContext.createUnknownParamsValue.and.returnValue(arbitraryUnknownValue);
			return injectionContext;
		};

		const expectDefaultInjectionContext = ({ injectionContext, effect, context, unknownParamsArgs = [] }) => {
			expect(injectionContext.getProcTargetData).toHaveBeenCalledWith(effect);
			expect(injectionContext.createSourcesFromContext).toHaveBeenCalledWith(context);
			expect(injectionContext.createUnknownParamsValue).toHaveBeenCalledWith(...unknownParamsArgs);
		};

		const createArbitraryContext = (params = {}) => ({
			source: 'arbitrary source',
			sourceId: 'arbitrary source id',
			...params,
		});
		const createExpectedSourcesForArbitraryContext = () => ['arbitrary source-arbitrary source id'];
		const createArbitraryTargetDataForEffect = () => ({
			'target type': 'arbitrary target type',
			'target area': 'arbitrary target area',
		});
		const createExpectedTargetDataForBuffFromArbitraryTargetDataInEffect = () => ({
			targetType: 'arbitrary target type',
			targetArea: 'arbitrary target area',
		});

		/**
		 * @type {import('../../datamine-types').ProcEffect?}
		 */
		const createArbitraryBaseEffect = (params = {}) => ({
			[EFFECT_DELAY_KEY]: arbitraryEffectDelay,
			...createArbitraryTargetDataForEffect(),
			...params,
		});

		/**
		 * @param {string} originalId
		 * @returns {(params?: object, propsToDelete?: string[]) => import('./buff-types').IBuff}
		 */
		const createFactoryForBaseBuffFromArbitraryEffect = (originalId) => {
			return (params = {}, propsToDelete = []) => {
				const result = {
					originalId,
					sources: createExpectedSourcesForArbitraryContext(),
					effectDelay: arbitraryEffectDelay,
					...createExpectedTargetDataForBuffFromArbitraryTargetDataInEffect(),
					...params,
				};
				if (propsToDelete && propsToDelete.length > 0) {
					propsToDelete.forEach((prop) => {
						if (prop in result) {
							delete result[prop];
						}
					});
				}
				return result;
			};
		};

		const testFunctionExistence = (mapKey) => {
			it('has a function on the map', () => {
				const map = getProcEffectToBuffMapping();
				expect(typeof map.get(mapKey))
					.toBe('function');
			});
		};

		const expectValidBuffIds = (buffIds = []) => {
			buffIds.forEach((buffId) => {
				it(`has a valid buffId entry in BuffId enum for ${buffId}`, () => {
					expect(buffId in BuffId).toBeTrue();
					expect(BuffId[buffId]).toEqual(buffId);
				});
			});
		};

		describe('proc 1', () => {
			const PARAMS_ORDER = ['atk%', 'flatAtk', 'crit%', 'bc%', 'hc%', 'dmg%'];
			const expectedBuffId = 'proc:1';
			const originalId = '1';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(originalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(originalId);
			});

			testFunctionExistence(originalId);

			expectValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6';
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ params });
				const context = createArbitraryContext({
					damageFrames: {
						hits: arbitraryHitCount,
						[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: arbitraryDamageDistribution,
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
						hits: arbitraryHitCount,
						distribution: arbitraryDamageDistribution,
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
						hits: arbitraryHitCount,
						[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: arbitraryDamageDistribution,
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
							hits: arbitraryHitCount,
							distribution: arbitraryDamageDistribution,
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
						hits: arbitraryHitCount,
						[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: arbitraryDamageDistribution,
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
						hits: arbitraryHitCount,
						distribution: arbitraryDamageDistribution,
					},
				})];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			describe('for missing parts of context.damageFrames', () => {
				it('defaults to 0 for hits and distribution if context.damageFrames does not exist', () => {
					const effect = createArbitraryBaseEffect();
					const context = createArbitraryContext();
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							hits: 0,
							distribution: 0,
						},
					})];
					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for hits if context.damageFrames.hits does not exist', () => {
					const effect = createArbitraryBaseEffect();
					const context = createArbitraryContext({
						damageFrames: {
							[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: arbitraryDamageDistribution,
						},
					});
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							hits: 0,
							distribution: arbitraryDamageDistribution,
						},
					})];

					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for distribution if context.damageFrames["hit dmg% distribution (total)"] does not exist', () => {
					const effect = createArbitraryBaseEffect();
					const context = createArbitraryContext({
						damageFrames: {
							hits: arbitraryHitCount,
						},
					});
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							hits: arbitraryHitCount,
							distribution: 0,
						},
					})];

					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});
			});

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

					const context = createArbitraryContext();
					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({ params: '0,0,0,0,0,0,123' });
				const context = createArbitraryContext();
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: { hits: 0, distribution: 0 },
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 6] });
			});
		});

		describe('proc 2', () => {
			const expectedBuffId = 'proc:2';
			const originalId = '2';

			const arbitraryRecX = 120;
			const arbitraryRecY = 25;
			const expectedRecAddedForArbitraryValues = 27.5;

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(originalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(originalId);
			});

			testFunctionExistence(originalId);
			expectValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = `1,2,${arbitraryRecX},${arbitraryRecY}`;
				const effect = createArbitraryBaseEffect({ params });
				const context = createArbitraryContext();
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						healLow: 1,
						healHigh: 2,
						'healerRec%': expectedRecAddedForArbitraryValues,
					},
				})];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,${arbitraryRecX},${arbitraryRecY},5,6,7`;
				const effect = createArbitraryBaseEffect({ params });
				const context = createArbitraryContext();
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

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					'heal low': 3,
					'heal high': 4,
					'rec added% (from healer)': 5,
				});
				const context = createArbitraryContext();
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						healLow: 3,
						healHigh: 4,
						'healerRec%': 5,
					},
				})];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					'heal low': '6',
					'heal high': '7',
					'rec added% (from healer)': '8',
				});
				const context = createArbitraryContext();
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						healLow: 6,
						healHigh: 7,
						'healerRec%': 8,
					},
				})];

				const result = mappingFunction(effect, context);
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
						const context = createArbitraryContext();
						const expectedValues = Object.entries(effectPropToResultPropMapping)
							.reduce((acc, [localEffectProp, resultProp]) => {
								acc[resultProp] = localEffectProp === effectProp ? 0 : 123;
								return acc;
							}, {});
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							value: expectedValues,
						})];

						const result = mappingFunction(effect, context);
						expect(result).toEqual(expectedResult);
					});
				});

				it('defaults all effect properties to 0 for non-number values', () => {
					const valuesInEffect = Object.keys(effectPropToResultPropMapping)
						.reduce((acc, prop) => {
							acc[prop] = 'not a number';
							return acc;
						}, {});
					const effect = createArbitraryBaseEffect(valuesInEffect);
					const context = createArbitraryContext();
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							healLow: 0,
							healHigh: 0,
							'healerRec%': 0,
						},
					})];

					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});

				it('defaults values for effect params to 0 if they are non-number or missing', () => {
					const effect = createArbitraryBaseEffect({ params: 'non-number' });
					const context = createArbitraryContext();
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							healLow: 0,
							healHigh: 0,
							'healerRec%': 10,
						},
					})];

					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `0,0,${arbitraryRecX},${arbitraryRecY},123`,
				});
				const context = createArbitraryContext();
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: { healHigh: 0, healLow: 0, 'healerRec%': expectedRecAddedForArbitraryValues },
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 4] });
			});
		});

		describe('proc 3', () => {
			const expectedBuffId = 'proc:3';
			const originalId = '3';

			const arbitraryRecParam = 80;
			const expectedRecAddedForArbitraryValues = 18;

			const EFFECT_TURN_DURATION_KEY = 'gradual heal turns (8)';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(originalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(originalId);
			});

			testFunctionExistence(originalId);
			expectValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = `1,2,${arbitraryRecParam},${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const context = createArbitraryContext();
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
					value: {
						healLow: 1,
						healHigh: 2,
						'targetRec%': expectedRecAddedForArbitraryValues,
					},
				})];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,${arbitraryRecParam},${arbitraryTurnDuration},5,6,7`;
				const effect = createArbitraryBaseEffect({ params });
				const context = createArbitraryContext();
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
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

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					'gradual heal low': 3,
					'gradual heal high': 4,
					'rec added% (from target)': 5,
					[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const context = createArbitraryContext();
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
					value: {
						healLow: 3,
						healHigh: 4,
						'targetRec%': 5,
					},
				})];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					'gradual heal low': '6',
					'gradual heal high': '7',
					'rec added% (from target)': '8',
					[EFFECT_TURN_DURATION_KEY]: '9',
				});
				const context = createArbitraryContext();
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 9,
					value: {
						healLow: 6,
						healHigh: 7,
						'targetRec%': 8,
					},
				})];

				const result = mappingFunction(effect, context);
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
							[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
						});
						const context = createArbitraryContext();
						const expectedValues = Object.entries(effectPropToResultPropMapping)
							.reduce((acc, [localEffectProp, resultProp]) => {
								acc[resultProp] = localEffectProp === effectProp ? 0 : 123;
								return acc;
							}, {});
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							duration: arbitraryTurnDuration,
							value: expectedValues,
						})];

						const result = mappingFunction(effect, context);
						expect(result).toEqual(expectedResult);
					});
				});

				it('returns nothing if all effect properties are non-number values', () => {
					const valuesInEffect = Object.keys(effectPropToResultPropMapping)
						.reduce((acc, prop) => {
							acc[prop] = 'not a number';
							return acc;
						}, {});
					const effect = createArbitraryBaseEffect({
						...valuesInEffect,
						[EFFECT_TURN_DURATION_KEY]: 'not a number',
					});
					const context = createArbitraryContext();
					const expectedResult = [];

					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});

				it('returns nothing if they effect params are non-number or missing', () => {
					const effect = createArbitraryBaseEffect({ params: 'non-number' });
					const context = createArbitraryContext();
					const expectedResult = [];

					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});
			});

			it('returns a turn modification buff if all stats are 0 and turn duration is non-zero', () => {
				const params = `0,0,0,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const context = createArbitraryContext();
				const expectedResult = [baseBuffFactory({
					id: BuffId.TURN_DURATION_MODIFICATION,
					value: {
						buffs: ['proc:3'],
						duration: arbitraryTurnDuration,
					},
				}, [EFFECT_DELAY_BUFF_PROP])];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `1,2,${arbitraryRecParam},${arbitraryTurnDuration},123`,
				});
				const context = createArbitraryContext();
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						duration: arbitraryTurnDuration,
						value: { healLow: 1, healHigh: 2, 'targetRec%': expectedRecAddedForArbitraryValues },
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 4] });
			});
		});

		describe('proc 4', () => {
			const expectedFlatFillId = 'proc:4:flat';
			const expectedPercentFillId = 'proc:4:percent';
			const FLAT_FILL_KEY = 'bb bc fill';
			const PERCENT_FILL_KEY = 'bb bc fill%';
			const originalId = '4';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(originalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(originalId);
			});

			testFunctionExistence(originalId);
			expectValidBuffIds([expectedFlatFillId, expectedPercentFillId]);

			it('uses the params property when it exists', () => {
				const params = '1,2';
				const effect = createArbitraryBaseEffect({ params });
				const context = createArbitraryContext();
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

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5';
				const effect = createArbitraryBaseEffect({ params });
				const context = createArbitraryContext();
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

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[FLAT_FILL_KEY]: 3,
					[PERCENT_FILL_KEY]: 4,
				});
				const context = createArbitraryContext();
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

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[FLAT_FILL_KEY]: '5',
					[PERCENT_FILL_KEY]: '6',
				});
				const context = createArbitraryContext();
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

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			describe('when values are missing', () => {
				it('defaults to 0 for missing flat fill value', () => {
					const effect = createArbitraryBaseEffect({
						[PERCENT_FILL_KEY]: 123,
					});
					const context = createArbitraryContext();
					const expectedResult = [
						baseBuffFactory({
							id: expectedPercentFillId,
							value: 123,
						}),
					];

					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for missing percent fill value', () => {
					const effect = createArbitraryBaseEffect({
						[FLAT_FILL_KEY]: 123,
					});
					const context = createArbitraryContext();
					const expectedResult = [
						baseBuffFactory({
							id: expectedFlatFillId,
							value: 123,
						}),
					];

					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});

				it('defaults all effect properties to 0 for non-number values', () => {
					const effect = createArbitraryBaseEffect({
						[FLAT_FILL_KEY]: 'not a number',
						[PERCENT_FILL_KEY]: 'not a number',
					});
					const context = createArbitraryContext();
					const expectedResult = [];

					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({ params: '1,2,123' });
				const context = createArbitraryContext();
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatFillId,
						sources: arbitrarySourceValue,
						value: 1,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: expectedPercentFillId,
						sources: arbitrarySourceValue,
						value: 2,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 2] });
			});
		});

		describe('proc 5', () => {
			const ELEMENT_MAPPING = {
				0: 'all',
				1: UnitElement.Fire,
				2: UnitElement.Water,
				3: UnitElement.Earth,
				4: UnitElement.Thunder,
				5: UnitElement.Light,
				6: UnitElement.Dark,
			};
			const STAT_PARAMS_ORDER = ['atk', 'def', 'rec', 'crit'];
			const TURN_DURATION_KEY = 'buff turns';
			const ELEMENT_BUFFED_KEY = 'element buffed';
			const originalId = '5';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(originalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(originalId);
			});

			testFunctionExistence(originalId);
			expectValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `proc:5:${stat}`));

			it('uses the params property when it exists', () => {
				const params = `0,1,2,3,4,${arbitraryTurnDuration}`;
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ params });
				const context = createArbitraryContext();
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `proc:5:${stat}`,
						duration: arbitraryTurnDuration,
						value: +splitParams[index + 1],
					});
				});

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `5,1,2,3,4,${arbitraryTurnDuration},7,8,9`;
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ params });
				const context = createArbitraryContext();
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `proc:5:${stat}`,
						duration: arbitraryTurnDuration,
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

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[ELEMENT_BUFFED_KEY]: 'arbitrary element', // element is taken at face value
					'atk% buff (1)': 6, // the numbers here are from actual data; separate unit tests handle more arbitrary cases
					'def% buff (3)': 7,
					'rec% buff (5)': 8,
					'crit% buff (7)': 9,
					[TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const context = createArbitraryContext();
				const expectedParamValues = [6, 7, 8, 9];
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `proc:5:${stat}`,
						duration: arbitraryTurnDuration,
						value: expectedParamValues[index],
						conditions: {
							targetElements: ['arbitrary element'],
						},
					});
				});

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			STAT_PARAMS_ORDER.forEach((statCase) => {
				Object.entries(ELEMENT_MAPPING).forEach(([elementKey, elementValue]) => {
					it(`returns only value for ${statCase} and ${elementValue} if it is non-zero and other stats are zero and only one element is specified`, () => {
						const params = [elementKey, ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0'), arbitraryTurnDuration].join(',');
						const effect = createArbitraryBaseEffect({ params });
						const context = createArbitraryContext();
						const expectedResult = [baseBuffFactory({
							id: `proc:5:${statCase}`,
							duration: arbitraryTurnDuration,
							value: 123,
						})];
						if (elementKey !== '0') {
							expectedResult[0].conditions = {
								targetElements: [elementValue],
							};
						}

						const result = mappingFunction(effect, context);
						expect(result).toEqual(expectedResult);
					});
				});

				it(`converts element values with no mapping to "unknown" and the only non-zero stat is ${statCase}`, () => {
					const params = ['123', ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0'), arbitraryTurnDuration].join(',');
					const effect = createArbitraryBaseEffect({ params });
					const context = createArbitraryContext();
					const expectedResult = [baseBuffFactory({
						id: `proc:5:${statCase}`,
						duration: arbitraryTurnDuration,
						value: 123,
						conditions: {
							targetElements: ['unknown'],
						},
					})];

					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});

				it(`parses ${statCase} buff in effect when params property does not exist`, () => {
					const effect = createArbitraryBaseEffect({
						[ELEMENT_BUFFED_KEY]: 'all',
						[`${statCase}% buff (${Math.floor(Math.random() * 100)})`]: 456,
						[TURN_DURATION_KEY]: arbitraryTurnDuration,
					});

					const context = createArbitraryContext();
					const expectedResult = [baseBuffFactory({
						id: `proc:5:${statCase}`,
						duration: arbitraryTurnDuration,
						value: 456,
					})];

					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});
			});

			it('parses all element buff in effect properties when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[ELEMENT_BUFFED_KEY]: 'all',
					'atk% buff': 1,
					[TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const context = createArbitraryContext();
				const expectedResult = [baseBuffFactory({
					id: 'proc:5:atk',
					duration: arbitraryTurnDuration,
					value: 1,
				})];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('parses lack of element buff property to "unknown" in effect properties when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					'def% buff': 1,
					[TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const context = createArbitraryContext();
				const expectedResult = [baseBuffFactory({
					id: 'proc:5:def',
					duration: arbitraryTurnDuration,
					value: 1,
					conditions: {
						targetElements: ['unknown'],
					},
				})];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('returns a turn modification buff if all stats are 0 and turn duration is non-zero', () => {
				const params = `0,0,0,0,0,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const context = createArbitraryContext();
				const expectedResult = [baseBuffFactory({
					id: BuffId.TURN_DURATION_MODIFICATION,
					value: {
						buffs: STAT_PARAMS_ORDER.map((stat) => `proc:5:${stat}`),
						duration: arbitraryTurnDuration,
					},
				}, [EFFECT_DELAY_BUFF_PROP])];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('returns nothing when turn duration and all stat values are zero', () => {
				const params = '0,0,0,0,0,0';
				const effect = createArbitraryBaseEffect({ params });
				const context = createArbitraryContext();
				const expectedResult = [];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `0,0,0,0,1,${arbitraryTurnDuration},123`,
				});
				const context = createArbitraryContext();
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:5:crit',
						sources: arbitrarySourceValue,
						duration: arbitraryTurnDuration,
						value: 1,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 6] });
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
			const originalId = '6';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(originalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(originalId);
			});

			testFunctionExistence(originalId);
			expectValidBuffIds(DROP_PARAMS_ORDER.map((p) => `proc:6:${p}`));

			it('uses the params property when it exists', () => {
				const params = `1,2,3,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const context = createArbitraryContext();
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:6:bc',
						duration: arbitraryTurnDuration,
						value: 1,
					}),
					baseBuffFactory({
						id: 'proc:6:hc',
						duration: arbitraryTurnDuration,
						value: 2,
					}),
					baseBuffFactory({
						id: 'proc:6:item',
						duration: arbitraryTurnDuration,
						value: 3,
					}),
				];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,3,${arbitraryTurnDuration},5,6,7`;
				const effect = createArbitraryBaseEffect({ params });
				const context = createArbitraryContext();
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:6:bc',
						duration: arbitraryTurnDuration,
						value: 1,
					}),
					baseBuffFactory({
						id: 'proc:6:hc',
						duration: arbitraryTurnDuration,
						value: 2,
					}),
					baseBuffFactory({
						id: 'proc:6:item',
						duration: arbitraryTurnDuration,
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

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[effectKeyMapping.bc]: 4,
					[effectKeyMapping.hc]: 5,
					[effectKeyMapping.item]: 6,
					[effectKeyMapping.turnDuration]: arbitraryTurnDuration,
				});
				const context = createArbitraryContext();
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:6:bc',
						duration: arbitraryTurnDuration,
						value: 4,
					}),
					baseBuffFactory({
						id: 'proc:6:hc',
						duration: arbitraryTurnDuration,
						value: 5,
					}),
					baseBuffFactory({
						id: 'proc:6:item',
						duration: arbitraryTurnDuration,
						value: 6,
					}),
				];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[effectKeyMapping.bc]: '7',
					[effectKeyMapping.hc]: '8',
					[effectKeyMapping.item]: '9',
					[effectKeyMapping.turnDuration]: `${arbitraryTurnDuration}`,
				});
				const context = createArbitraryContext();
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:6:bc',
						duration: arbitraryTurnDuration,
						value: 7,
					}),
					baseBuffFactory({
						id: 'proc:6:hc',
						duration: arbitraryTurnDuration,
						value: 8,
					}),
					baseBuffFactory({
						id: 'proc:6:item',
						duration: arbitraryTurnDuration,
						value: 9,
					}),
				];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			describe('when values are missing', () => {
				Object.entries(effectKeyMapping)
					.filter(([resultKey]) => resultKey !== 'turnDuration')
					.forEach(([resultKey, effectKey]) => {
						it(`returns only value for ${resultKey} if it is non-zero and other rates are zero in the params property`, () => {
							const params = [...DROP_PARAMS_ORDER.map((param) => param === resultKey ? '123' : '0'), arbitraryTurnDuration].join(',');
							const effect = createArbitraryBaseEffect({ params });
							const expectedResult = [baseBuffFactory({
								id: `proc:6:${resultKey}`,
								duration: arbitraryTurnDuration,
								value: 123,
							})];

							const context = createArbitraryContext();
							const result = mappingFunction(effect, context);
							expect(result).toEqual(expectedResult);
						});

						it(`returns only value for ${resultKey} if it is non-zero and other rates are zero when params property does not exist`, () => {
							const effect = createArbitraryBaseEffect({
								[effectKey]: 123,
								[effectKeyMapping.turnDuration]: arbitraryTurnDuration,
							});
							const expectedResult = [baseBuffFactory({
								id: `proc:6:${resultKey}`,
								duration: arbitraryTurnDuration,
								value: 123,
							})];

							const context = createArbitraryContext();
							const result = mappingFunction(effect, context);
							expect(result).toEqual(expectedResult);
						});
					});

				it('returns nothing if they effect params are non-number or missing', () => {
					const effect = createArbitraryBaseEffect({ params: 'non-number' });
					const context = createArbitraryContext();
					const expectedResult = [];

					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});
			});

			it('returns a turn modification buff if all rates are 0 and turn duration is non-zero', () => {
				const params = `0,0,0,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const context = createArbitraryContext();
				const expectedResult = [baseBuffFactory({
					id: BuffId.TURN_DURATION_MODIFICATION,
					value: {
						buffs: DROP_PARAMS_ORDER.map((p) => `proc:6:${p}`),
						duration: arbitraryTurnDuration,
					},
				}, [EFFECT_DELAY_BUFF_PROP])];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `0,0,1,${arbitraryTurnDuration},123`,
				});
				const context = createArbitraryContext();
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:6:item',
						sources: arbitrarySourceValue,
						duration: arbitraryTurnDuration,
						value: 1,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 4] });
			});
		});

		describe('proc 7', () => {
			const AI_EFFECT_KEY = 'angel idol recover hp%';
			const originalId = '7';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(originalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(originalId);
			});

			testFunctionExistence(originalId);
			expectValidBuffIds(['proc:7']);

			it('uses the params property when it exists', () => {
				const effect = createArbitraryBaseEffect({ params: '1' });
				const expectedResult = [baseBuffFactory({
					id: 'proc:7',
					value: 1,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const effect = createArbitraryBaseEffect({ params: '1,2,3,4' });
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:7',
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
					id: 'proc:7',
					value: 1234,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({ [AI_EFFECT_KEY]: '5678' });
				const expectedResult = [baseBuffFactory({
					id: 'proc:7',
					value: 5678,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff value when params value is 0', () => {
				const effect = createArbitraryBaseEffect({ params: '0' });
				const expectedResult = [baseBuffFactory({
					id: 'proc:7',
					value: 0,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff value when params property and AI property on effect do not exist', () => {
				const effect = createArbitraryBaseEffect();
				const expectedResult = [baseBuffFactory({
					id: 'proc:7',
					value: 0,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({ params: '10,123' });
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:7',
						sources: arbitrarySourceValue,
						value: 10,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 1] });
			});
		});
	});
});
