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
		const DEFAULT_TURN_DURATION_KEY = 'buff turns';

		const ELEMENT_MAPPING = {
			0: 'all',
			1: UnitElement.Fire,
			2: UnitElement.Water,
			3: UnitElement.Earth,
			4: UnitElement.Thunder,
			5: UnitElement.Light,
			6: UnitElement.Dark,
		};

		const AILMENT_MAPPING = {
			1: 'poison',
			2: 'weak',
			3: 'sick',
			4: 'injury',
			5: 'curse',
			6: 'paralysis',
			7: 'atk down',
			8: 'def down',
			9: 'rec down',
		};

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
		 * @param {import('../../datamine-types').ProcEffect?} params
		 * @returns {import('../../datamine-types').ProcEffect}
		 */
		const createArbitraryBaseEffect = (params = {}) => ({
			[EFFECT_DELAY_KEY]: arbitraryEffectDelay,
			...createArbitraryTargetDataForEffect(),
			...params,
		});

		/**
		 * @param {string} originalId
		 * @returns {(params?: import('./buff-types').IBuff, propsToDelete?: string[]) => import('./buff-types').IBuff}
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
			const expectedOriginalId = '1';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
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
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							hits: 0,
							distribution: 0,
						},
					})];
					const result = mappingFunction(createArbitraryBaseEffect(), createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for hits if context.damageFrames.hits does not exist', () => {
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

					const result = mappingFunction(createArbitraryBaseEffect(), context);
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for distribution if context.damageFrames["hit dmg% distribution (total)"] does not exist', () => {
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

					const result = mappingFunction(createArbitraryBaseEffect(), context);
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

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({ params: '0,0,0,0,0,0,123' });
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

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 6] });
			});
		});

		describe('proc 2', () => {
			const expectedBuffId = 'proc:2';
			const expectedOriginalId = '2';

			const arbitraryRecX = 120;
			const arbitraryRecY = 25;
			const expectedRecAddedForArbitraryValues = 27.5;

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			expectValidBuffIds([expectedBuffId]);

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

				it('defaults all effect properties to 0 for non-number values', () => {
					const valuesInEffect = Object.keys(effectPropToResultPropMapping)
						.reduce((acc, prop) => {
							acc[prop] = 'not a number';
							return acc;
						}, {});
					const effect = createArbitraryBaseEffect(valuesInEffect);
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							healLow: 0,
							healHigh: 0,
							'healerRec%': 0,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('defaults values for effect params to 0 if they are non-number or missing', () => {
					const effect = createArbitraryBaseEffect({ params: 'non-number' });
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							healLow: 0,
							healHigh: 0,
							'healerRec%': 10,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `0,0,${arbitraryRecX},${arbitraryRecY},123`,
				});
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

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 4] });
			});
		});

		describe('proc 3', () => {
			const expectedBuffId = 'proc:3';
			const expectedOriginalId = '3';

			const arbitraryRecParam = 80;
			const expectedRecAddedForArbitraryValues = 18;

			const EFFECT_TURN_DURATION_KEY = 'gradual heal turns (8)';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			expectValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = `1,2,${arbitraryRecParam},${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
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
				const params = `1,2,${arbitraryRecParam},${arbitraryTurnDuration},5,6,7`;
				const effect = createArbitraryBaseEffect({ params });
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

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					'gradual heal low': 3,
					'gradual heal high': 4,
					'rec added% (from target)': 5,
					[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
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
							[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
						});
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

						const result = mappingFunction(effect, createArbitraryContext());
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
					const expectedResult = [];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns nothing if they effect params are non-number or missing', () => {
					const effect = createArbitraryBaseEffect({ params: 'non-number' });
					const expectedResult = [];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('returns a turn modification buff if all stats are 0 and turn duration is non-zero', () => {
				const params = `0,0,0,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: BuffId.TURN_DURATION_MODIFICATION,
					value: {
						buffs: ['proc:3'],
						duration: arbitraryTurnDuration,
					},
				}, [EFFECT_DELAY_BUFF_PROP])];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `1,2,${arbitraryRecParam},${arbitraryTurnDuration},123`,
				});
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

				const context = createArbitraryContext();
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
			const expectedOriginalId = '4';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			expectValidBuffIds([expectedFlatFillId, expectedPercentFillId]);

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

				it('defaults all effect properties to 0 for non-number values', () => {
					const effect = createArbitraryBaseEffect({
						[FLAT_FILL_KEY]: 'not a number',
						[PERCENT_FILL_KEY]: 'not a number',
					});
					const expectedResult = [];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({ params: '1,2,123' });
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

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 2] });
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
			expectValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `proc:5:${stat}`));

			it('uses the params property when it exists', () => {
				const params = `0,1,2,3,4,${arbitraryTurnDuration}`;
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `proc:5:${stat}`,
						duration: arbitraryTurnDuration,
						value: +splitParams[index + 1],
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `5,1,2,3,4,${arbitraryTurnDuration},7,8,9`;
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ params });
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
					[DEFAULT_TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
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

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			STAT_PARAMS_ORDER.forEach((statCase) => {
				Object.entries(ELEMENT_MAPPING).forEach(([elementKey, elementValue]) => {
					it(`returns only value for ${statCase} and ${elementValue} if it is non-zero and other stats are zero and only one element is specified`, () => {
						const params = [elementKey, ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0'), arbitraryTurnDuration].join(',');
						const effect = createArbitraryBaseEffect({ params });
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

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				it(`converts element values with no mapping to "unknown" and the only non-zero stat is ${statCase}`, () => {
					const params = ['123', ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0'), arbitraryTurnDuration].join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: `proc:5:${statCase}`,
						duration: arbitraryTurnDuration,
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
						[DEFAULT_TURN_DURATION_KEY]: arbitraryTurnDuration,
					});
					const expectedResult = [baseBuffFactory({
						id: `proc:5:${statCase}`,
						duration: arbitraryTurnDuration,
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
					[DEFAULT_TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const expectedResult = [baseBuffFactory({
					id: 'proc:5:atk',
					duration: arbitraryTurnDuration,
					value: 1,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('parses lack of element buff property to "unknown" in effect properties when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					'def% buff': 1,
					[DEFAULT_TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const expectedResult = [baseBuffFactory({
					id: 'proc:5:def',
					duration: arbitraryTurnDuration,
					value: 1,
					conditions: {
						targetElements: ['unknown'],
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a turn modification buff if all stats are 0 and turn duration is non-zero', () => {
				const params = `0,0,0,0,0,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: BuffId.TURN_DURATION_MODIFICATION,
					value: {
						buffs: STAT_PARAMS_ORDER.map((stat) => `proc:5:${stat}`),
						duration: arbitraryTurnDuration,
					},
				}, [EFFECT_DELAY_BUFF_PROP])];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns nothing when turn duration and all stat values are zero', () => {
				const params = '0,0,0,0,0,0';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `0,0,0,0,1,${arbitraryTurnDuration},123`,
				});
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

				const context = createArbitraryContext();
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
			const expectedOriginalId = '6';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			expectValidBuffIds(DROP_PARAMS_ORDER.map((p) => `proc:6:${p}`));

			it('uses the params property when it exists', () => {
				const params = `1,2,3,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
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

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,3,${arbitraryTurnDuration},5,6,7`;
				const effect = createArbitraryBaseEffect({ params });
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

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[effectKeyMapping.bc]: 4,
					[effectKeyMapping.hc]: 5,
					[effectKeyMapping.item]: 6,
					[effectKeyMapping.turnDuration]: arbitraryTurnDuration,
				});
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

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[effectKeyMapping.bc]: '7',
					[effectKeyMapping.hc]: '8',
					[effectKeyMapping.item]: '9',
					[effectKeyMapping.turnDuration]: `${arbitraryTurnDuration}`,
				});
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

				const result = mappingFunction(effect, createArbitraryContext());
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

							const result = mappingFunction(effect, createArbitraryContext());
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

							const result = mappingFunction(effect, createArbitraryContext());
							expect(result).toEqual(expectedResult);
						});
					});

				it('returns nothing if they effect params are non-number or missing', () => {
					const effect = createArbitraryBaseEffect({ params: 'non-number' });
					const expectedResult = [];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('returns a turn modification buff if all rates are 0 and turn duration is non-zero', () => {
				const params = `0,0,0,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: BuffId.TURN_DURATION_MODIFICATION,
					value: {
						buffs: DROP_PARAMS_ORDER.map((p) => `proc:6:${p}`),
						duration: arbitraryTurnDuration,
					},
				}, [EFFECT_DELAY_BUFF_PROP])];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `0,0,1,${arbitraryTurnDuration},123`,
				});
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

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 4] });
			});
		});

		describe('proc 7', () => {
			const AI_EFFECT_KEY = 'angel idol recover hp%';
			const expectedOriginalId = '7';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
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

		describe('proc 8', () => {
			const expectedFlatFillId = 'proc:8:flat';
			const expectedPercentFillId = 'proc:8:percent';
			const FLAT_FILL_KEY = 'max hp increase';
			const PERCENT_FILL_KEY = 'max hp% increase';
			const expectedOriginalId = '8';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			expectValidBuffIds([expectedFlatFillId, expectedPercentFillId]);

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

				it('defaults all effect properties to 0 for non-number values', () => {
					const effect = createArbitraryBaseEffect({
						[FLAT_FILL_KEY]: 'not a number',
						[PERCENT_FILL_KEY]: 'not a number',
					});
					const expectedResult = [];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({ params: '1,2,123' });
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

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 2] });
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
			expectValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `proc:9:${stat}`));

			it('uses the params property when it exists', () => {
				const params = `0,1,2,3,2,4,5,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:9:atk',
						duration: arbitraryTurnDuration,
						value: {
							value: 2,
							chance: 3,
						},
					}),
					baseBuffFactory({
						id: 'proc:9:def',
						duration: arbitraryTurnDuration,
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
				const params = `1,2,3,4,3,5,6,${arbitraryTurnDuration},9,10,11`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:9:def',
						duration: arbitraryTurnDuration,
						value: {
							value: 3,
							chance: 4,
						},
						conditions: {
							targetElements: ['fire'],
						},
					}),
					baseBuffFactory({
						id: 'proc:9:rec',
						duration: arbitraryTurnDuration,
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
					[DEFAULT_TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const expectedParamValues1 = [6, 7, 8];
				const expectedParamValues2 = [10, 11, 12];
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `proc:9:${stat}`,
						duration: arbitraryTurnDuration,
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
						id: `proc:9:${stat}`,
						duration: arbitraryTurnDuration,
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
						const params = [elementKey, STAT_PARAM_MAPPING[statCase], 123, 456, 0, 0, 0, arbitraryTurnDuration].join(',');
						const effect = createArbitraryBaseEffect({ params });
						const expectedResult = [baseBuffFactory({
							id: `proc:9:${statCase}`,
							duration: arbitraryTurnDuration,
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
					const params = ['123', STAT_PARAM_MAPPING[statCase], 123, 456, 0, 0, 0, arbitraryTurnDuration].join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: `proc:9:${statCase}`,
						duration: arbitraryTurnDuration,
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
							[DEFAULT_TURN_DURATION_KEY]: arbitraryTurnDuration,
						});
						const expectedResult = [baseBuffFactory({
							id: `proc:9:${statCase}`,
							duration: arbitraryTurnDuration,
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
					[DEFAULT_TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const expectedResult = [baseBuffFactory({
					id: 'proc:9:atk',
					duration: arbitraryTurnDuration,
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
					[DEFAULT_TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const expectedResult = [baseBuffFactory({
					id: 'proc:9:def',
					duration: arbitraryTurnDuration,
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
				const params = [0, 4, 456, 789, 0, 0, 0, arbitraryTurnDuration].join(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = STAT_PARAMS_ORDER.map((stat) => {
					return baseBuffFactory({
						id: `proc:9:${stat}`,
						duration: arbitraryTurnDuration,
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
				const params = [0, 123, 456, 789, 0, 0, 0, arbitraryTurnDuration].join(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: 'proc:9:unknown',
					duration: arbitraryTurnDuration,
					value: {
						value: 456,
						chance: 789,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a turn modification buff if all stats are 0 and turn duration is non-zero', () => {
				const params = `0,0,0,0,0,0,0,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: BuffId.TURN_DURATION_MODIFICATION,
					value: {
						buffs: STAT_PARAMS_ORDER.map((stat) => `proc:9:${stat}`),
						duration: arbitraryTurnDuration,
					},
				}, [EFFECT_DELAY_BUFF_PROP])];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns nothing when turn duration and all stat values are zero', () => {
				const params = '0,0,0,0,0,0,0,0';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `0,1,2,3,0,0,0,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:9:atk',
						sources: arbitrarySourceValue,
						duration: arbitraryTurnDuration,
						value: {
							value: 2,
							chance: 3,
						},
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 8] });
			});
		});

		describe('proc 10', () => {
			const expectedOriginalId = '10';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			expectValidBuffIds(Object.values(AILMENT_MAPPING).concat(['unknown']).map((a) => `proc:10:${a}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6,7,8';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = Object.values(AILMENT_MAPPING)
					.slice(0, 8)
					.map((ailment) => baseBuffFactory({
						id: `proc:10:${ailment}`,
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
						id: `proc:10:${ailment}`,
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
					id: 'proc:10:rec down',
					value: true,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			Object.entries(AILMENT_MAPPING).forEach(([ailmentKey, ailmentName]) => {
				it(`returns an entry for ${ailmentName} when it is present in the params property`, () => {
					const params = [ailmentKey, '0,0,0,0,0,0'].join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: `proc:10:${ailmentName}`,
						value: true,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`returns an entry for ${ailmentName} when it is present in the effect and no params property does not exist`, () => {
					const effect = createArbitraryBaseEffect({ [`remove ${ailmentName}`]: true });
					const expectedResult = [baseBuffFactory({
						id: `proc:10:${ailmentName}`,
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
						id: `proc:10:${ailment}`,
						value: true,
					}));

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('parses params outside of the known ailments as unknown', () => {
				const params = '123,0,0,0,0,0,0';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: 'proc:10:unknown',
					value: true,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('parses "remove all status ailments" property in effect as unknown when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({ 'remove all status ailments': true });
				const expectedResult = [baseBuffFactory({
					id: 'proc:10:unknown',
					value: true,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns nothing if all params are 0', () => {
				const params = new Array(8).fill('0').join(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: '0,0,0,0,0,0,0,1,123',
				});
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:10:poison',
						sources: arbitrarySourceValue,
						value: true,
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 8] });
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
			expectValidBuffIds(Object.values(AILMENT_MAPPING).concat(['unknown']).map((a) => `proc:11:${a}`));

			it('uses the params property when it exists', () => {
				const params = '1,2';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: 'proc:11:poison',
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
						id: 'proc:11:sick',
						value: 4,
					}),
					baseBuffFactory({
						id: 'proc:11:curse',
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
						id: 'proc:11:injury',
						value: 5,
					}),
					baseBuffFactory({
						id: 'proc:11:paralysis',
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
					id: 'proc:11:paralysis',
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
						id: `proc:11:${ailmentName}`,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`returns an entry for ${ailmentName} when it is present in the effect and no params property does not exist`, () => {
					const effect = createArbitraryBaseEffect({ [AILMENT_EFFECT_KEY_MAPPING[ailmentName]]: 456 });
					const expectedResult = [baseBuffFactory({
						id: `proc:11:${ailmentName}`,
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
						id: `proc:11:${ailment}`,
						value: index + 1,
					}));

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('parses params outside of the known ailments as unknown', () => {
				const params = '123,456';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: 'proc:11:unknown',
					value: 456,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns values when no ailment is specified but chance is non-zero', () => {
				const params = '0,123';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: 'proc:11:unknown',
					value: 123,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns nothing if all params are 0', () => {
				const params = new Array(8).fill('0').join(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: '1,2,123',
				});
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:11:poison',
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

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 2] });
			});
		});

		describe('proc 12', () => {
			const expectedBuffId = 'proc:12';
			const expectedOriginalId = '12';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			expectValidBuffIds([expectedBuffId]);

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

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: '1,123',
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
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

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 1] });
			});
		});

		describe('proc 13', () => {
			const PARAMS_ORDER = ['atk%', 'flatAtk', 'crit%', 'bc%', 'hc%', 'hits'];
			const expectedBuffId = 'proc:13';
			const expectedOriginalId = '13';
			const expectedTargetArea = 'random';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);

			expectValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6';
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ params });
				const context = createArbitraryContext({
					damageFrames: {
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
						distribution: arbitraryDamageDistribution,
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
							distribution: arbitraryDamageDistribution,
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
						distribution: arbitraryDamageDistribution,
					},
					targetArea: expectedTargetArea,
				})];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			describe('for missing parts of context.damageFrames', () => {
				it('defaults to 0 for distribution if context.damageFrames does not exist', () => {
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							hits: 0,
							distribution: 0,
						},
						targetArea: expectedTargetArea,
					})];
					const result = mappingFunction(createArbitraryBaseEffect(), createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for distribution if context.damageFrames["hit dmg% distribution (total)"] does not exist', () => {
					const context = createArbitraryContext({
						damageFrames: {},
					});
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							hits: 0,
							distribution: 0,
						},
						targetArea: expectedTargetArea,
					})];

					const result = mappingFunction(createArbitraryBaseEffect(), context);
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

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({ params: '0,0,0,0,0,0,123' });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: { hits: 0, distribution: 0 },
						targetType: undefined,
						targetArea: expectedTargetArea,
					}),
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 6] });
			});
		});

		describe('proc 14', () => {
			const PARAMS_ORDER = ['atk%', 'flatAtk', 'crit%', 'bc%', 'hc%', 'dmg%', 'drainLow%', 'drainHigh%'];
			const expectedBuffId = 'proc:14';
			const expectedOriginalId = '14';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			expectValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6,7,8';
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
				const params = '1,2,3,4,5,6,7,8,9,10,11';
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
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							hits: 0,
							distribution: 0,
						},
					})];
					const result = mappingFunction(createArbitraryBaseEffect(), createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for hits if context.damageFrames.hits does not exist', () => {
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

					const result = mappingFunction(createArbitraryBaseEffect(), context);
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for distribution if context.damageFrames["hit dmg% distribution (total)"] does not exist', () => {
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

					const result = mappingFunction(createArbitraryBaseEffect(), context);
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

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({ params: '0,0,0,0,0,0,0,0,123' });
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

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 8] });
			});
		});

		describe('proc 16', () => {
			const expectedOriginalId = '16';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			expectValidBuffIds(Object.values(ELEMENT_MAPPING).concat(['unknown']).map((element) => `proc:16:${element}`));

			it('uses the params property when it exists', () => {
				const params = `0,1,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: 'proc:16:all',
					duration: arbitraryTurnDuration,
					value: 1,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('uses the params property when it exists', () => {
				const params = `1,2,${arbitraryTurnDuration},4,5,6`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:16:fire',
						duration: arbitraryTurnDuration,
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
					[DEFAULT_TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const expectedResult = [baseBuffFactory({
					id: 'proc:16:fire',
					duration: arbitraryTurnDuration,
					value: 3,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			Object.entries(ELEMENT_MAPPING).forEach(([elementKey, elementValue]) => {
				it(`parses value for ${elementValue}`, () => {
					const params = `${elementKey},123,${arbitraryTurnDuration}`;
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: `proc:16:${elementValue}`,
						duration: arbitraryTurnDuration,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`parses value for ${elementValue} when params property does not exist`, () => {
					const effect = createArbitraryBaseEffect({
						[`mitigate ${elementValue} attacks (${Math.floor(Math.random() * 100)})`]: 456,
						[DEFAULT_TURN_DURATION_KEY]: arbitraryTurnDuration,
					});
					const expectedResult = [baseBuffFactory({
						id: `proc:16:${elementValue}`,
						duration: arbitraryTurnDuration,
						value: 456,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('parses unknown elements to "unknown"', () => {
				const params = `1234,123,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: 'proc:16:unknown',
					duration: arbitraryTurnDuration,
					value: 123,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('parses unknown elements to "unknown" when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					'mitigate attacks': 456,
					[DEFAULT_TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const expectedResult = [baseBuffFactory({
					id: 'proc:16:unknown',
					duration: arbitraryTurnDuration,
					value: 456,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a turn modification buff when no mitigation value is given', () => {
				const params = `0,0,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: BuffId.TURN_DURATION_MODIFICATION,
					value: {
						buffs: Object.values(ELEMENT_MAPPING).concat(['unknown']).map((stat) => `proc:16:${stat}`),
						duration: arbitraryTurnDuration,
					},
				}, [EFFECT_DELAY_BUFF_PROP])];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a turn modification buff when no mitigation value is given and params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					'attacks': 456,
					[DEFAULT_TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const expectedResult = [baseBuffFactory({
					id: BuffId.TURN_DURATION_MODIFICATION,
					value: {
						buffs: Object.values(ELEMENT_MAPPING).concat(['unknown']).map((stat) => `proc:16:${stat}`),
						duration: arbitraryTurnDuration,
					},
				}, [EFFECT_DELAY_BUFF_PROP])];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a turn modification buff when no mitigation value is given and turn duration is zero', () => {
				const params = '0,0,0';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `0,1,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:16:all',
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

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 3] });
			});
		});
	});
});
