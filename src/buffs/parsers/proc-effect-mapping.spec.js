const { getProcEffectToBuffMapping } = require('./proc-effect-mapping');
const { BuffId } = require('./buff-types');
const { UnitElement, Ailment } = require('../../datamine-types');

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
		const arbitraryBuffSourceOfBurstType = 'bb';

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
				buffSourceIsBurstType: jasmine.createSpy('buffSourceIsBurstType'),
			};
			injectionContext.getProcTargetData.and.returnValue(arbitraryTargetData);
			injectionContext.createSourcesFromContext.and.returnValue(arbitrarySourceValue);
			injectionContext.createUnknownParamsValue.and.returnValue(arbitraryUnknownValue);
			injectionContext.buffSourceIsBurstType.and.returnValue(true);
			return injectionContext;
		};

		const expectDefaultInjectionContext = ({ injectionContext, effect, context, unknownParamsArgs = [], buffSourceIsBurstTypeArgs = [] }) => {
			let hasAnyChecks = false;
			if (effect) {
				hasAnyChecks = true;
				expect(injectionContext.getProcTargetData).toHaveBeenCalledWith(effect);
			}

			if (context) {
				hasAnyChecks = true;
				expect(injectionContext.createSourcesFromContext).toHaveBeenCalledWith(context);
			}

			if (unknownParamsArgs.length > 0) {
				hasAnyChecks = true;
				expect(injectionContext.createUnknownParamsValue).toHaveBeenCalledWith(...unknownParamsArgs);
			}

			if (buffSourceIsBurstTypeArgs.length > 0) {
				hasAnyChecks = true;
				expect(injectionContext.buffSourceIsBurstType).toHaveBeenCalledWith(...buffSourceIsBurstTypeArgs);
			}

			expect(hasAnyChecks).toBeTrue(); // ensure that this checker function is called correctly
		};

		const expectNoParamsBuffWithEffectAndContext = ({ effect, context, injectionContext, expectedSources }) => {
			const expectedResult = [baseBuffFactory({
				id: BuffId.NO_PARAMS_SPECIFIED,
			}, [EFFECT_DELAY_BUFF_PROP, ...BUFF_TARGET_PROPS])];
			if (expectedSources) {
				expectedResult[0].sources = expectedSources;
			}

			const result = mappingFunction(effect, context, injectionContext);
			expect(result).toEqual(expectedResult);
		};

		/**
		 * @param {import('./buff-types').IEffectToBuffConversionContext} params
		 * @returns {import('./buff-types').IEffectToBuffConversionContext}
		 */
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

		const testValidBuffIds = (buffIds = []) => {
			buffIds.forEach((buffId) => {
				it(`has a valid buffId entry in BuffId enum for ${buffId}`, () => {
					expect(buffId in BuffId).toBeTrue();
					expect(BuffId[buffId]).toEqual(buffId);
				});
			});
		};

		/**
		 * @param {object} arg0
		 * @param {(turnDuration: number) => string} arg0.createParamsWithZeroValueAndTurnDuration
		 * @param {string[]} arg0.buffIdsInTurnDurationBuff
		 */
		const testTurnDurationScenarios = ({
			createParamsWithZeroValueAndTurnDuration,
			buffIdsInTurnDurationBuff,
		}) => {
			it('returns a turn modification buff if turn duration is non-zero and source is not burst type', () => {
				const params = createParamsWithZeroValueAndTurnDuration(arbitraryTurnDuration);
				const effect = createArbitraryBaseEffect({ params });
				const context = createArbitraryContext();
				const expectedResult = [baseBuffFactory({
					id: BuffId.TURN_DURATION_MODIFICATION,
					value: {
						buffs: buffIdsInTurnDurationBuff,
						duration: arbitraryTurnDuration,
					},
				}, [EFFECT_DELAY_BUFF_PROP])];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff if turn duration is non-zero and source is of burst type', () => {
				const params = createParamsWithZeroValueAndTurnDuration(arbitraryTurnDuration);
				const effect = createArbitraryBaseEffect({ params });
				const context = createArbitraryContext({ source: arbitraryBuffSourceOfBurstType });
				expectNoParamsBuffWithEffectAndContext({ effect, context, expectedSources: [`${arbitraryBuffSourceOfBurstType}-arbitrary source id`] });
			});

			it('returns a no params buff if turn duration is 0', () => { // basically tests when no params are given
				const params = createParamsWithZeroValueAndTurnDuration(0);
				const effect = createArbitraryBaseEffect({ params });
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses buffSourceIsBurstType for checking whether source type is burst', () => {
				const params = createParamsWithZeroValueAndTurnDuration(1);
				const effect = createArbitraryBaseEffect({ params });
				const context = createArbitraryContext({ source: arbitraryBuffSourceOfBurstType });

				const injectionContext = createDefaultInjectionContext();
				injectionContext.createUnknownParamsValue = null;
				expectNoParamsBuffWithEffectAndContext({ effect, context, injectionContext, expectedSources: arbitrarySourceValue });
				expectDefaultInjectionContext({ injectionContext, buffSourceIsBurstTypeArgs: [arbitraryBuffSourceOfBurstType] });
			});
		};

		/**
		 * @description Common set of tests for effects regarding when different parts of the context for attacks are missing.
		 * @param {object} context
		 * @param {string} context.expectedBuffId
		 * @param {string} context.expectedTargetArea
		 * @param {boolean?} context.testHits
		 * @param {(param: string) => number} context.getExpectedValueFromParam
		 */
		const testMissingDamageFramesScenarios = ({
			expectedBuffId,
			expectedTargetArea,
			testHits = true,
		}) => {
			describe('for missing parts of context.damageFrames', () => {
				/**
				 * @param {import('./buff-types').IBuff} buff
				 */
				const applyTargetAreaAsNeeded = (buff) => {
					if (expectedTargetArea) {
						buff.targetArea = expectedTargetArea;
					}
				};
				it('returns a no params buff if context.damageFrames does not exist and no other parameters are specified', () => {
					expectNoParamsBuffWithEffectAndContext({ effect: createArbitraryBaseEffect(), context: createArbitraryContext() });
				});

				if (testHits) {
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
						applyTargetAreaAsNeeded(expectedResult[0]);

						const result = mappingFunction(createArbitraryBaseEffect(), context);
						expect(result).toEqual(expectedResult);
					});
				}

				it('defaults to 0 for distribution if context.damageFrames["hit dmg% distribution (total)"] does not exist', () => {
					const damageFrames = {};
					let expectedFinalHits = 0;
					if (testHits) {
						damageFrames.hits = arbitraryHitCount;
						expectedFinalHits = arbitraryHitCount;
					}
					const context = createArbitraryContext({ damageFrames });
					if (testHits) {
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							value: {
								hits: expectedFinalHits,
								distribution: 0,
							},
						})];
						applyTargetAreaAsNeeded(expectedResult[0]);

						const result = mappingFunction(createArbitraryBaseEffect(), context);
						expect(result).toEqual(expectedResult);
					} else {
						// buff gets hit value from elseewhere, so specifying only hits is identical to specifying nothing for damage frames
						expectNoParamsBuffWithEffectAndContext({ effect: createArbitraryBaseEffect(), context });
					}
				});
			});
		};

		/**
		 * @description Common set of tests for procs that contain only one numerical parameter and turn duration.
		 * @param {object} context
		 * @param {string} context.expectedOriginalId
		 * @param {string} context.expectedBuffId
		 * @param {string} context.effectValueKey
		 * @param {string} context.effectTurnDurationKey
		 * @param {(param: string) => number} context.getExpectedValueFromParam
		 */
		const testProcWithSingleNumericalParameterAndTurnDuration = ({
			expectedOriginalId,
			expectedBuffId,
			effectValueKey,
			effectTurnDurationKey = DEFAULT_TURN_DURATION_KEY,
			getExpectedValueFromParam = (param) => +param,
		}) => {
			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = `1,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
					value: getExpectedValueFromParam('1'),
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `1,${arbitraryTurnDuration},3,4,5`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
						value: getExpectedValueFromParam('1'),
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
					[effectValueKey]: 2,
					[effectTurnDurationKey]: arbitraryTurnDuration,
				});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
					value: 2,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[effectValueKey]: '3',
					[effectTurnDurationKey]: arbitraryTurnDuration,
				});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
					value: 3,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when non-turn duration value is 0', () => {
				testTurnDurationScenarios({
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,${duration}`,
					buffIdsInTurnDurationBuff: [expectedBuffId],
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `1,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						duration: arbitraryTurnDuration,
						value: getExpectedValueFromParam('1'),
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
			testValidBuffIds([expectedBuffId]);

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

			testMissingDamageFramesScenarios({ expectedBuffId });

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
				const effect = createArbitraryBaseEffect({ params: '0,1,0,0,0,0,123' });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: { flatAtk: 1, hits: 0, distribution: 0 },
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
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('defaults all effect properties to 0 for non-number values', () => {
					const valuesInEffect = Object.keys(effectPropToResultPropMapping)
						.reduce((acc, prop) => {
							acc[prop] = 'not a number';
							return acc;
						}, {});
					const effect = createArbitraryBaseEffect(valuesInEffect);
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('defaults values for effect params to 0 if they are non-number or missing', () => {
					const effect = createArbitraryBaseEffect({ params: 'non-number' });
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `0,1,${arbitraryRecX},${arbitraryRecY},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: { healHigh: 1, healLow: 0, 'healerRec%': expectedRecAddedForArbitraryValues },
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
			testValidBuffIds([expectedBuffId]);

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
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('returns a no params buff when the effect params are non-number or missing', () => {
					const effect = createArbitraryBaseEffect({ params: 'non-number' });
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			describe('when all stats are 0', () => {
				testTurnDurationScenarios({
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,${duration}`,
					buffIdsInTurnDurationBuff: [expectedBuffId],
				});
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
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('defaults all effect properties to 0 for non-number values', () => {
					const effect = createArbitraryBaseEffect({
						[FLAT_FILL_KEY]: 'not a number',
						[PERCENT_FILL_KEY]: 'not a number',
					});
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({ params: '100,2,123' });
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
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `proc:5:${stat}`));

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

			describe('when all stats are 0', () => {
				testTurnDurationScenarios({
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,${duration}`,
					buffIdsInTurnDurationBuff: STAT_PARAMS_ORDER.map((stat) => `proc:5:${stat}`),
				});
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
			testValidBuffIds(DROP_PARAMS_ORDER.map((p) => `proc:6:${p}`));

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

				it('returns a no params buff if the effect params are non-number or missing', () => {
					const effect = createArbitraryBaseEffect({ params: 'non-number' });
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			describe('when all rates are 0', () => {
				testTurnDurationScenarios({
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,${duration}`,
					buffIdsInTurnDurationBuff: DROP_PARAMS_ORDER.map((p) => `proc:6:${p}`),
				});
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
			const expectedBuffId = 'proc:7';
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

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({ params: '10,123' });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
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
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('defaults all effect properties to 0 for non-number values', () => {
					const effect = createArbitraryBaseEffect({
						[FLAT_FILL_KEY]: 'not a number',
						[PERCENT_FILL_KEY]: 'not a number',
					});
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
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
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `proc:9:${stat}`));

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

			describe('when all stats are 0', () => {
				testTurnDurationScenarios({
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,0,0,${duration}`,
					buffIdsInTurnDurationBuff: STAT_PARAMS_ORDER.map((stat) => `proc:9:${stat}`),
				});
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
			testValidBuffIds(Object.values(AILMENT_MAPPING).concat(['unknown']).map((a) => `proc:10:${a}`));

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

			it('returns a no params buff if all params are 0', () => {
				const params = new Array(8).fill('0').join(',');
				const effect = createArbitraryBaseEffect({ params });
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
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
			testValidBuffIds(Object.values(AILMENT_MAPPING).concat(['unknown']).map((a) => `proc:11:${a}`));

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

			it('returns a no params buff if all params are 0', () => {
				const params = new Array(8).fill('0').join(',');
				const effect = createArbitraryBaseEffect({ params });
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
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

			testValidBuffIds([expectedBuffId]);

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

			testMissingDamageFramesScenarios({
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

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({ params: '0,1,0,0,0,0,123' });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: { flatAtk: 1, hits: 0, distribution: 0 },
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
			testValidBuffIds([expectedBuffId]);

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

			testMissingDamageFramesScenarios({ expectedBuffId });

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
				const effect = createArbitraryBaseEffect({ params: '0,1,0,0,0,0,0,0,123' });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: { flatAtk: 1, hits: 0, distribution: 0 },
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
			testValidBuffIds(Object.values(ELEMENT_MAPPING).concat(['unknown']).map((element) => `proc:16:${element}`));

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

			it('returns a buff entry for extra parameters', () => {
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

			describe('when no mitigation value is given', () => {
				testTurnDurationScenarios({
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,${duration}`,
					buffIdsInTurnDurationBuff: Object.values(ELEMENT_MAPPING).concat(['unknown']).map((stat) => `proc:16:${stat}`),
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

		describe('proc 17', () => {
			const AILMENTS_ORDER = [Ailment.Poison, Ailment.Weak, Ailment.Sick, Ailment.Injury, Ailment.Curse, Ailment.Paralysis];
			const EFFECT_TURN_DURATION_KEY = 'resist status ails turns';
			const expectedOriginalId = '17';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			it('uses the params property when it exists', () => {
				const params = `1,2,3,4,5,6,${arbitraryTurnDuration}`;
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
					return baseBuffFactory({
						id: `proc:17:${ailment}`,
						duration: arbitraryTurnDuration,
						value: +splitParams[index],
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,3,4,5,6,${arbitraryTurnDuration},8,9,10`;
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
					return baseBuffFactory({
						id: `proc:17:${ailment}`,
						duration: arbitraryTurnDuration,
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
					[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const expectedParamValues = [7, 8, 9, 10, 11, 12];
				const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
					return baseBuffFactory({
						id: `proc:17:${ailment}`,
						duration: arbitraryTurnDuration,
						value: expectedParamValues[index],
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			AILMENTS_ORDER.forEach((ailmentCase) => {
				it(`returns only value for ${ailmentCase} if it is non-zero and other stats are zero`, () => {
					const params = AILMENTS_ORDER.map((ailment) => ailment === ailmentCase ? '123' : '0').concat([arbitraryTurnDuration]).join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: `proc:17:${ailmentCase}`,
						duration: arbitraryTurnDuration,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`returns only value for ${ailmentCase} if it is non-zero and other stats are zero and params property does not exist`, () => {
					const ailmentKey = ailmentCase !== Ailment.Weak ? ailmentCase : 'weaken';
					const effect = createArbitraryBaseEffect({
						[`resist ${ailmentKey}% (${Math.floor(Math.random() * 100)})`]: 123,
						[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
					});
					const expectedResult = [baseBuffFactory({
						id: `proc:17:${ailmentCase}`,
						duration: arbitraryTurnDuration,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			describe('when all resistances are 0', () => {
				testTurnDurationScenarios({
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,0,${duration}`,
					buffIdsInTurnDurationBuff: AILMENTS_ORDER.map((ailment) => `proc:17:${ailment}`),
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `0,0,0,0,0,1,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:17:paralysis',
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 7] });
			});
		});

		describe('proc 18', () => {
			testProcWithSingleNumericalParameterAndTurnDuration({
				expectedOriginalId: '18',
				expectedBuffId: 'proc:18',
				effectValueKey: 'dmg% reduction',
				effectTurnDurationKey: 'dmg% reduction turns (36)',
			});
		});

		describe('proc 19', () => {
			testProcWithSingleNumericalParameterAndTurnDuration({
				expectedOriginalId: '19',
				expectedBuffId: 'proc:19',
				effectValueKey: 'increase bb gauge gradual',
				effectTurnDurationKey: 'increase bb gauge gradual turns (37)',
				getExpectedValueFromParam: (param) => +param / 100,
			});
		});

		describe('proc 20', () => {
			const EFFECT_TURN_DURATION_KEY = 'bc fill when attacked turns (38)';

			const expectedBuffId = 'proc:20';
			const expectedOriginalId = '20';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = `100,200,3,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
					value: {
						fillLow: 1,
						fillHigh: 2,
						chance: 3,
					},
					conditions: {
						whenAttacked: true,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `100,200,3,${arbitraryTurnDuration},5,6,7`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
						value: {
							fillLow: 1,
							fillHigh: 2,
							chance: 3,
						},
						conditions: {
							whenAttacked: true,
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
					'bc fill when attacked low': 3,
					'bc fill when attacked high': 4,
					'bc fill when attacked%': 5,
					[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
				});

				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
					value: {
						fillLow: 3,
						fillHigh: 4,
						chance: 5,
					},
					conditions: {
						whenAttacked: true,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					'bc fill when attacked low': '6',
					'bc fill when attacked high': '7',
					'bc fill when attacked%': '8',
					[EFFECT_TURN_DURATION_KEY]: '9',
				});

				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 9,
					value: {
						fillLow: 6,
						fillHigh: 7,
						chance: 8,
					},
					conditions: {
						whenAttacked: true,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are missing', () => {
				const effectPropToResultPropMapping = {
					'bc fill when attacked low': 'fillLow',
					'bc fill when attacked high': 'fillHigh',
					'bc fill when attacked%': 'chance',
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
							conditions: {
								whenAttacked: true,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				it('returns a no params buff if all effect properties are non-number values', () => {
					const valuesInEffect = Object.keys(effectPropToResultPropMapping)
						.reduce((acc, prop) => {
							acc[prop] = 'not a number';
							return acc;
						}, {});
					const effect = createArbitraryBaseEffect({
						...valuesInEffect,
						[EFFECT_TURN_DURATION_KEY]: 'not a number',
					});
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('returns a no params buff if they effect params are non-number or missing', () => {
					const effect = createArbitraryBaseEffect({ params: 'non-number' });
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			describe('when non-turn duration values are 0', () => {
				testTurnDurationScenarios({
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,${duration}`,
					buffIdsInTurnDurationBuff: [expectedBuffId],
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `100,200,3,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						duration: arbitraryTurnDuration,
						value: { fillLow: 1, fillHigh: 2, chance: 3 },
						conditions: {
							whenAttacked: true,
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 4] });
			});
		});

		describe('proc 22', () => {
			testProcWithSingleNumericalParameterAndTurnDuration({
				expectedOriginalId: '22',
				expectedBuffId: 'proc:22',
				effectValueKey: 'defense% ignore',
				effectTurnDurationKey: 'defense% ignore turns (39)',
			});
		});

		describe('proc 23', () => {
			const effectValueKey = 'spark dmg% buff (40)';
			const effectTurnDurationKey = DEFAULT_TURN_DURATION_KEY;
			const expectedBuffId = 'proc:23';
			const expectedOriginalId = '23';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = `1,0,0,0,0,0,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
					value: 1,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,3,4,5,6,${arbitraryTurnDuration},8,9,10`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
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
				const params = `1,2,3,4,5,6,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
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
					[effectTurnDurationKey]: arbitraryTurnDuration,
				});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
					value: 2,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[effectValueKey]: '3',
					[effectTurnDurationKey]: arbitraryTurnDuration,
				});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
					value: 3,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when non-turn duration value is 0', () => {
				testTurnDurationScenarios({
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,0,${duration}`,
					buffIdsInTurnDurationBuff: [expectedBuffId],
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `1,2,3,4,5,6,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['0','2','3','4','5','6','0','123']), 0] });
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
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `proc:24:${stat}`));

			it('uses the params property when it exists', () => {
				const params = `1,2,3,4,${arbitraryTurnDuration}`;
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `proc:24:${stat}`,
						duration: arbitraryTurnDuration,
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
				const params = `2,2,3,4,${arbitraryTurnDuration},6,7,8`;
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `proc:24:${stat}`,
						duration: arbitraryTurnDuration,
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
					[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const expectedParamValues = [4, 5, 6];
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `proc:24:${stat}`,
						duration: arbitraryTurnDuration,
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
					it(`returns only value for ${statCase} and ${convertedStatValue} if it is non-zero and other stats are zero and converted stat is ${convertedStatValue}`, () => {
						const params = [convertedStatKey, ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0'), arbitraryTurnDuration].join(',');
						const effect = createArbitraryBaseEffect({ params });
						const expectedResult = [baseBuffFactory({
							id: `proc:24:${statCase}`,
							duration: arbitraryTurnDuration,
							value: {
								convertedStat: convertedStatValue,
								value: 123,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				Object.entries(effectStatToResultStatMapping).forEach(([convertedStatKEy, convertedStatValue]) => {
					it(`returns only value for ${statCase} and ${convertedStatValue} if it is non-zero and other stats are zero and converted stat is ${convertedStatValue} and params property does not exist`, () => {
						const effect = createArbitraryBaseEffect({
							[CONVERTED_STAT_KEY]: convertedStatKEy,
							[`${statCase}% buff (${Math.floor(Math.random() * 100)})`]: 456,
							[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
						});
						const expectedResult = [baseBuffFactory({
							id: `proc:24:${statCase}`,
							duration: arbitraryTurnDuration,
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
					const params = ['123', ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0'), arbitraryTurnDuration].join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: `proc:24:${statCase}`,
						duration: arbitraryTurnDuration,
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
						[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
					});
					const expectedResult = [baseBuffFactory({
						id: `proc:24:${statCase}`,
						duration: arbitraryTurnDuration,
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
					[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const expectedResult = [baseBuffFactory({
					id: 'proc:24:def',
					duration: arbitraryTurnDuration,
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
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,${duration}`,
					buffIdsInTurnDurationBuff: STAT_PARAMS_ORDER.map((stat) => `proc:24:${stat}`),
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `4,0,0,1,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:24:rec',
						sources: arbitrarySourceValue,
						duration: arbitraryTurnDuration,
						value: {
							convertedStat: 'hp',
							value: 1,
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 5] });
			});
		});

		describe('proc 26', () => {
			const expectedBuffId = 'proc:26';
			const expectedOriginalId = '26';
			const hitIncreaseEffectKey = 'hit increase/hit';
			const extraHitDamageEffectKey = 'extra hits dmg%';
			const effectTurnDurationKey = 'hit increase buff turns (50)';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = `1,0,2,0,0,0,0,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
					value: {
						hitIncreasePerHit: 1,
						extraHitDamage: 2,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,3,4,5,6,7,${arbitraryTurnDuration},9,10,11`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
						value: {
							hitIncreasePerHit: 1,
							extraHitDamage: 3,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						value: {
							param_1: '2',
							param_3: '4',
							param_4: '5',
							param_5: '6',
							param_6: '7',
							param_8: '9',
							param_9: '10',
							param_10: '11',
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra intermediate parameters', () => {
				const params = `1,2,3,4,5,6,7,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
						value: {
							hitIncreasePerHit: 1,
							extraHitDamage: 3,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						value: {
							param_1: '2',
							param_3: '4',
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
					[hitIncreaseEffectKey]: 3,
					[extraHitDamageEffectKey]: 4,
					[effectTurnDurationKey]: arbitraryTurnDuration,
				});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
					value: {
						hitIncreasePerHit: 3,
						extraHitDamage: 4,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[hitIncreaseEffectKey]: '3',
					[extraHitDamageEffectKey]: '4',
					[effectTurnDurationKey]: arbitraryTurnDuration,
				});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
					value: {
						hitIncreasePerHit: 3,
						extraHitDamage: 4,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are missing', () => {
				const effectPropToResultPropMapping = {
					[hitIncreaseEffectKey]: 'hitIncreasePerHit',
					[extraHitDamageEffectKey]: 'extraHitDamage',
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
							[effectTurnDurationKey]: arbitraryTurnDuration,
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

				it('returns a no params buff if all effect properties are non-number values', () => {
					const valuesInEffect = Object.keys(effectPropToResultPropMapping)
						.reduce((acc, prop) => {
							acc[prop] = 'not a number';
							return acc;
						}, {});
					const effect = createArbitraryBaseEffect({
						...valuesInEffect,
						[effectTurnDurationKey]: 'not a number',
					});
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('returns a no params buff if they effect params are non-number or missing', () => {
					const effect = createArbitraryBaseEffect({ params: 'non-number' });
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			describe('when non-turn duration values are 0', () => {
				testTurnDurationScenarios({
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,0,0,${duration}`,
					buffIdsInTurnDurationBuff: [expectedBuffId],
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `1,2,3,4,5,6,7,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						duration: arbitraryTurnDuration,
						value: { hitIncreasePerHit: 1, extraHitDamage: 3 },
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['0','2','0','4','5','6','7','0','123']), 0] });
			});
		});

		describe('proc 27', () => {
			const PARAMS_ORDER = ['hpDamageLow%', 'hpDamageHigh%', 'hpDamageChance%', 'atk%', 'flatAtk', 'crit%', 'bc%', 'hc%', 'dmg%'];
			const expectedBuffId = 'proc:27';
			const expectedOriginalId = '27';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
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
				const params = '1,2,3,4,5,6,7,8,9,10,11,12';
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
							param_9: '10',
							param_10: '11',
							param_11: '12',
						},
					}),
				];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const mockValues = [10, 11, 12, 13, 14, 15, 16, 17, 18];
				const effectKeyOverrideMapping = {
					flatAtk: 'bb flat atk',
					'hpDamageLow%': 'hp% damage low',
					'hpDamageHigh%': 'hp% damage high',
					'hpDamageChance%': 'hp% damage chance%',
				};
				const valuesInEffect = PARAMS_ORDER.reduce((acc, stat, index) => {
					const key = effectKeyOverrideMapping[stat] || `bb ${stat}`;
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

			testMissingDamageFramesScenarios({ expectedBuffId });

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
				const effect = createArbitraryBaseEffect({ params: '0,0,0,0,1,0,0,0,0,123' });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: { flatAtk: 1, hits: 0, distribution: 0 },
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 9] });
			});
		});

		describe('proc 28', () => {
			const expectedBuffId = 'proc:28';
			const expectedOriginalId = '28';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const effect = createArbitraryBaseEffect({ params: '1' });
				const context = createArbitraryContext({
					damageFrames: {
						hits: arbitraryHitCount,
						[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: arbitraryDamageDistribution,
					},
				});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						value: 1,
						hits: arbitraryHitCount,
						distribution: arbitraryDamageDistribution,
					},
				})];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const effect = createArbitraryBaseEffect({ params: '1,2,3,4' });
				const context = createArbitraryContext({
					damageFrames: {
						hits: arbitraryHitCount,
						[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: arbitraryDamageDistribution,
					},
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: {
							value: 1,
							hits: arbitraryHitCount,
							distribution: arbitraryDamageDistribution,
						},
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

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({ 'fixed damage': 2 });
				const context = createArbitraryContext({
					damageFrames: {
						hits: arbitraryHitCount,
						[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: arbitraryDamageDistribution,
					},
				}, {});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						value: 2,
						hits: arbitraryHitCount,
						distribution: arbitraryDamageDistribution,
					},
				})];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			testMissingDamageFramesScenarios({ expectedBuffId });

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({ params: '1,123' });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: { value: 1, hits: 0, distribution: 0 },
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

		describe('proc 29', () => {
			const PARAMS_ORDER = ['atk%', 'flatAtk', 'crit%', 'bc%', 'hc%', 'dmg%'];
			const expectedBuffId = 'proc:29';
			const expectedOriginalId = '29';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
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
					acc[param] = +splitParams[index + 3];
					return acc;
				}, {});
				const expectedElements = ['fire', 'water', 'earth'];
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						elements: expectedElements,
						...expectedValuesForParams,
						hits: arbitraryHitCount,
						distribution: arbitraryDamageDistribution,
					},
				})];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '4,5,6,4,5,6,7,8,9,10,11,12';
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ params });
				const context = createArbitraryContext({
					damageFrames: {
						hits: arbitraryHitCount,
						[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: arbitraryDamageDistribution,
					},
				});
				const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
					acc[param] = +splitParams[index + 3];
					return acc;
				}, {});
				const expectedElements = ['thunder', 'light', 'dark'];
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: {
							elements: expectedElements,
							...expectedValuesForParams,
							hits: arbitraryHitCount,
							distribution: arbitraryDamageDistribution,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						value: {
							param_9: '10',
							param_10: '11',
							param_11: '12',
						},
					}),
				];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const mockValues = [10, 11, 12, 13, 14, 15];
				const effectKeyOverrideMapping = {
					flatAtk: 'bb flat atk',
				};
				const valuesInEffect = PARAMS_ORDER.reduce((acc, stat, index) => {
					const key = effectKeyOverrideMapping[stat] || `bb ${stat}`;
					acc[key] = mockValues[index];
					return acc;
				}, {});
				valuesInEffect['bb elements'] = ['arbitrary element 1', 'arbitrary element 2'];
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
						elements: ['arbitrary element 1', 'arbitrary element 2'], // taken at face value
						...expectedValuesForParams,
						hits: arbitraryHitCount,
						distribution: arbitraryDamageDistribution,
					},
				})];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			testMissingDamageFramesScenarios({ expectedBuffId });

			PARAMS_ORDER.forEach((paramCase) => {
				it(`returns only value for ${paramCase} if it is non-zero and other stats are zero and elements are not specified`, () => {
					const params = ['0,0,0'].concat(PARAMS_ORDER.map((param) => param === paramCase ? '789' : '0')).join(',');
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

			describe('when parsing elements', () => {
				Object.entries(ELEMENT_MAPPING)
					.filter(([elementKey]) => elementKey !== '0')
					.forEach(([elementKey, elementValue]) => {
						it(`parses element param for ${elementValue}`, () => {
							const params = [elementKey, '0,0'].concat(PARAMS_ORDER.map(() => '0')).join(',');
							const effect = createArbitraryBaseEffect({ params });
							const expectedResult = [baseBuffFactory({
								id: expectedBuffId,
								value: {
									elements: [elementValue],
									hits: 0,
									distribution: 0,
								},
							})];

							const result = mappingFunction(effect, createArbitraryContext());
							expect(result).toEqual(expectedResult);
						});
					});

				it('converts element values with no mapping to "unknown"', () => {
					const params = ['123,456,789'].concat(PARAMS_ORDER.map(() => '0')).join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							elements: ['unknown', 'unknown', 'unknown'],
							hits: 0,
							distribution: 0,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a no params buff when no parameters are given', () => {
					const effect = createArbitraryBaseEffect();
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('does not parse effect["bb elements"] if it is not an array and params property does not exist', () => {
					const effect = createArbitraryBaseEffect({ 'bb elements': 'not an array' });
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({ params: '0,0,0,0,1,0,0,0,0,123' });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: { flatAtk: 1, hits: 0, distribution: 0 },
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 9] });
			});
		});

		describe('proc 30', () => {
			const validElements = [1, 2, 3, 4, 5, 6].map((elementKey) => ELEMENT_MAPPING[elementKey]);
			const effectTurnDurationKey = 'elements added turns';
			const expectedOriginalId = '30';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(validElements.concat(['unknown']).map((element) => `proc:30:${element}`));

			it('uses the params property when it exists', () => {
				const params = `1,2,3,4,5,6,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = validElements.map((element) => {
					return baseBuffFactory({
						id: `proc:30:${element}`,
						duration: arbitraryTurnDuration,
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,3,4,5,6,${arbitraryTurnDuration},8,9,10`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = validElements.map((element) => {
					return baseBuffFactory({
						id: `proc:30:${element}`,
						duration: arbitraryTurnDuration,
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
					'elements added': validElements.slice(),
					[effectTurnDurationKey]: arbitraryTurnDuration,
				});

				const expectedResult = validElements.map((element) => {
					return baseBuffFactory({
						id: `proc:30:${element}`,
						duration: arbitraryTurnDuration,
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			Object.entries(ELEMENT_MAPPING)
				.filter(([, elementValue]) => validElements.includes(elementValue))
				.forEach(([elementKey, elementValue]) => {
					it(`parses value for ${elementValue}`, () => {
						const params = `${elementKey},0,0,0,0,0,${arbitraryTurnDuration}`;
						const effect = createArbitraryBaseEffect({ params });
						const expectedResult = [baseBuffFactory({
							id: `proc:30:${elementValue}`,
							duration: arbitraryTurnDuration,
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});

					it(`parses value for ${elementValue} when params property does not exist`, () => {
						const effect = createArbitraryBaseEffect({
							'elements added': [elementValue],
							[effectTurnDurationKey]: arbitraryTurnDuration,
						});

						const expectedResult = [baseBuffFactory({
							id: `proc:30:${elementValue}`,
							duration: arbitraryTurnDuration,
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

			describe('for unknown element values', () => {
				it('parses unknown elements to "unknown"', () => {
					const params = `123,0,0,0,456,0,${arbitraryTurnDuration}`;
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [
						baseBuffFactory({
							id: 'proc:30:unknown',
							duration: arbitraryTurnDuration,
						}),
						baseBuffFactory({
							id: 'proc:30:unknown',
							duration: arbitraryTurnDuration,
						}),
					];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('parses unknown elements to "unknown" when params property does not exist', () => {
					const effect = createArbitraryBaseEffect({
						'elements added': ['arbitrary element 1', 'arbitrary element 2'],
						[effectTurnDurationKey]: arbitraryTurnDuration,
					});
					const expectedResult = [
						baseBuffFactory({
							id: 'proc:30:unknown',
							duration: arbitraryTurnDuration,
						}),
						baseBuffFactory({
							id: 'proc:30:unknown',
							duration: arbitraryTurnDuration,
						}),
					];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns buff for unknown element when params property does not exist and effect["elements added"] property is defined but is not an array', () => {
					const effect = createArbitraryBaseEffect({
						'elements added': 'arbitrary element 1,arbitrary element 2',
						[effectTurnDurationKey]: arbitraryTurnDuration,
					});
					const expectedResult = [
						baseBuffFactory({
							id: 'proc:30:unknown',
							duration: arbitraryTurnDuration,
						}),
					];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a no params buff when params property does not exist and effect["elements added"] property is not defined and turn duration is 0', () => {
					const effect = createArbitraryBaseEffect({
						[effectTurnDurationKey]: 0,
					});
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			describe('when no elements are given', () => {
				testTurnDurationScenarios({
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,0,${duration}`,
					buffIdsInTurnDurationBuff: validElements.concat(['unknown']).map((e) => `proc:30:${e}`),
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `1,0,0,0,0,0,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:30:fire',
						sources: arbitrarySourceValue,
						duration: arbitraryTurnDuration,
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 7] });
			});
		});

		describe('proc 31', () => {
			const expectedFlatFillId = 'proc:31:flat';
			const expectedPercentFillId = 'proc:31:percent';
			const FLAT_FILL_KEY = 'increase bb gauge';
			const expectedOriginalId = '31';

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
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatFillId,
						value: 3,
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[FLAT_FILL_KEY]: '4',
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatFillId,
						value: 4,
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are missing', () => {
				it('returns a no params buff when no parameters are given', () => {
					const effect = createArbitraryBaseEffect();
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('defaults all effect properties to 0 for non-number values', () => {
					const effect = createArbitraryBaseEffect({
						[FLAT_FILL_KEY]: 'not a number',
					});
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({ params: '100,2,123' });
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

		describe('proc 32', () => {
			const EFFECT_KEY = 'set attack element attribute';
			const ELEMENT_MAPPING = {
				1: UnitElement.Fire,
				2: UnitElement.Water,
				3: UnitElement.Earth,
				4: UnitElement.Thunder,
				5: UnitElement.Light,
				6: UnitElement.Dark,
			};
			const expectedOriginalId = '32';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(Object.values(ELEMENT_MAPPING).concat(['unknown']).map((element) => `proc:32:${element}`));

			it('uses the params property when it exists', () => {
				const effect = createArbitraryBaseEffect({ params: '1' });
				const expectedResult = [baseBuffFactory({
					id: 'proc:32:fire',
					value: true,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const effect = createArbitraryBaseEffect({ params: '2,2,3,4' });
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:32:water',
						value: true,
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
				const effect = createArbitraryBaseEffect({ [EFFECT_KEY]: 'earth' });
				const expectedResult = [baseBuffFactory({
					id: 'proc:32:earth',
					value: true,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			Object.entries(ELEMENT_MAPPING).forEach(([elementKey, elementValue]) => {
				it(`parses value for ${elementValue}`, () => {
					const effect = createArbitraryBaseEffect({ params: `${elementKey}` });
					const expectedResult = [baseBuffFactory({
						id: `proc:32:${elementValue}`,
						value: true,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`parses value for ${elementValue} when params property does not exist`, () => {
					const effect = createArbitraryBaseEffect({
						[EFFECT_KEY]: elementValue,
					});
					const expectedResult = [baseBuffFactory({
						id: `proc:32:${elementValue}`,
						value: true,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('parses unknown elements to "unknown"', () => {
				const effect = createArbitraryBaseEffect({ params: '1234' });
				const expectedResult = [baseBuffFactory({
					id: 'proc:32:unknown',
					value: true,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('parses unknown elements to "unknown" when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[EFFECT_KEY]: 'arbitrary unknown element',
				});
				const expectedResult = [baseBuffFactory({
					id: 'proc:32:unknown',
					value: true,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('parses "all" buff in effect parameters to "unknown" when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[EFFECT_KEY]: 'all',
				});
				const expectedResult = [baseBuffFactory({
					id: 'proc:32:unknown',
					value: true,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff if param is 0', () => {
				const effect = createArbitraryBaseEffect({ params: '0' });
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({ params: '5,123' });
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:32:light',
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 1] });
			});
		});

		describe('proc 33', () => {
			const expectedBuffId = 'proc:33';
			const expectedOriginalId = '33';

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
				const effect = createArbitraryBaseEffect({ 'clear buff chance%': 456 });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: 456,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff when no parameters are given', () => {
				const effect = createArbitraryBaseEffect();
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('returns a no params buff if parsed value from params is zero', () => {
				const effect = createArbitraryBaseEffect({ params: '0' });
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('returns a no params buff if all effect properties are non-number values', () => {
				const effect = createArbitraryBaseEffect({ 'clear buff chance%': 'not a number' });
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('returns a no params buff if they effect params are non-number or missing', () => {
				const effect = createArbitraryBaseEffect({ params: 'non-number' });
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
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

		describe('proc 34', () => {
			const expectedFlatDrainId = 'proc:34:flat';
			const expectedPercentDrainId = 'proc:34:percent';
			const FLAT_DRAIN_LOW_KEY = 'base bb gauge reduction low';
			const FLAT_DRAIN_HIGH_KEY = 'base bb gauge reduction high';
			const PERCENT_DRAIN_LOW_KEY = 'bb gauge% reduction low';
			const PERCENT_DRAIN_HIGH_KEY = 'bb gauge% reduction high';
			const CHANCE_KEY = 'bb gauge reduction chance%';
			const expectedOriginalId = '34';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedFlatDrainId, expectedPercentDrainId]);

			it('uses the params property when it exists', () => {
				const params = '100,200,3,4,5';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatDrainId,
						value: {
							drainLow: 1,
							drainHigh: 2,
							chance: 5,
						},
					}),
					baseBuffFactory({
						id: expectedPercentDrainId,
						value: {
							drainLow: 3,
							drainHigh: 4,
							chance: 5,
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '100,200,3,4,5,6,7,8';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatDrainId,
						value: {
							drainLow: 1,
							drainHigh: 2,
							chance: 5,
						},
					}),
					baseBuffFactory({
						id: expectedPercentDrainId,
						value: {
							drainLow: 3,
							drainHigh: 4,
							chance: 5,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						value: {
							param_5: '6',
							param_6: '7',
							param_7: '8',
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[FLAT_DRAIN_LOW_KEY]: 6,
					[FLAT_DRAIN_HIGH_KEY]: 7,
					[PERCENT_DRAIN_LOW_KEY]: 8,
					[PERCENT_DRAIN_HIGH_KEY]: 9,
					[CHANCE_KEY]: 10,
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatDrainId,
						value: {
							drainLow: 6,
							drainHigh: 7,
							chance: 10,
						},
					}),
					baseBuffFactory({
						id: expectedPercentDrainId,
						value: {
							drainLow: 8,
							drainHigh: 9,
							chance: 10,
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[FLAT_DRAIN_LOW_KEY]: '11',
					[FLAT_DRAIN_HIGH_KEY]: '12',
					[PERCENT_DRAIN_LOW_KEY]: '13',
					[PERCENT_DRAIN_HIGH_KEY]: '14',
					[CHANCE_KEY]: '15',
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatDrainId,
						value: {
							drainLow: 11,
							drainHigh: 12,
							chance: 15,
						},
					}),
					baseBuffFactory({
						id: expectedPercentDrainId,
						value: {
							drainLow: 13,
							drainHigh: 14,
							chance: 15,
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are missing', () => {
				const nonChanceKeys = [FLAT_DRAIN_LOW_KEY, FLAT_DRAIN_HIGH_KEY, PERCENT_DRAIN_LOW_KEY, PERCENT_DRAIN_HIGH_KEY];
				nonChanceKeys.forEach((effectKey) => {
					it(`defaults to 0 for missing effect parameter [${effectKey}] when params property does not exist`, () => {
						const valuesInEffect = nonChanceKeys.reduce((acc, key) => {
							if (key !== effectKey) {
								acc[key] = 123;
							}
							return acc;
						}, {});
						valuesInEffect[CHANCE_KEY] = 456;
						const effect = createArbitraryBaseEffect(valuesInEffect);
						const expectedResult = [
							baseBuffFactory({
								id: expectedFlatDrainId,
								value: {
									drainLow: effectKey === FLAT_DRAIN_LOW_KEY ? 0 : 123,
									drainHigh: effectKey === FLAT_DRAIN_HIGH_KEY ? 0 : 123,
									chance: 456,
								},
							}),
							baseBuffFactory({
								id: expectedPercentDrainId,
								value: {
									drainLow: effectKey === PERCENT_DRAIN_LOW_KEY ? 0 : 123,
									drainHigh: effectKey === PERCENT_DRAIN_HIGH_KEY ? 0 : 123,
									chance: 456,
								},
							}),
						];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				it('does not return a flat drain buff if both flat drain parameters are 0', () => {
					const params = '0,0,1,2,3';
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: expectedPercentDrainId,
						value: {
							drainLow: 1,
							drainHigh: 2,
							chance: 3,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('does not return a percent drain buff if both percent drain parameters are 0', () => {
					const params = '100,200,0,0,3';
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: expectedFlatDrainId,
						value: {
							drainLow: 1,
							drainHigh: 2,
							chance: 3,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a no params buff when no parameters are given', () => {
					const effect = createArbitraryBaseEffect();
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('returns a no params buff when drain values are zero and chance value is non-zero', () => {
					const params = '0,0,0,0,123';
					const effect = createArbitraryBaseEffect({ params });
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('defaults all effect properties to 0 for non-number values', () => {
					const effect = createArbitraryBaseEffect({
						[FLAT_DRAIN_LOW_KEY]: 'not a number',
						[FLAT_DRAIN_HIGH_KEY]: 'not a number',
						[PERCENT_DRAIN_LOW_KEY]: 'not a number',
						[PERCENT_DRAIN_HIGH_KEY]: 'not a number',
						[CHANCE_KEY]: 'not a number',
					});
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({ params: '300,400,5,6,7,123' });
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatDrainId,
						sources: arbitrarySourceValue,
						value: { drainLow: 3, drainHigh: 4, chance: 7 },
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: expectedPercentDrainId,
						sources: arbitrarySourceValue,
						value: { drainLow: 5, drainHigh: 6, chance: 7 },
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 5] });
			});
		});

		describe('proc 36', () => {
			testProcWithSingleNumericalParameterAndTurnDuration({
				expectedOriginalId: '36',
				expectedBuffId: 'proc:36',
				effectValueKey: 'invalidate LS chance%',
				effectTurnDurationKey: 'invalidate LS turns (60)',
			});
		});

		describe('proc 37', () => {
			const expectedBuffId = 'proc:37';
			const expectedOriginalId = '37';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						summonGroup: '1',
						summonId: '2',
						positionX: 3,
						positionY: 4,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6,7';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: {
							summonGroup: '1',
							summonId: '2',
							positionX: 3,
							positionY: 4,
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

			it('falls back to unknown proc params property when params property does not exist', () => {
				const params = '5,6,7,8';
				const effect = createArbitraryBaseEffect({ 'unknown proc param': params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						summonGroup: '5',
						summonId: '6',
						positionX: 7,
						positionY: 8,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are missing', () => {
				// order of test cases should match order in params property
				[
					{ property: 'summonGroup', expectedDefault: '' },
					{ property: 'summonId', expectedDefault: '' },
					{ property: 'positionX', expectedDefault: 0 },
					{ property: 'positionY', expectedDefault: 0 },
				].forEach((testCase, index) => {
					it(`defaults to ${testCase.expectedDefault === '' ? 'empty string' : testCase.expectedDefault} for missing ${testCase.property} value`, () => {
						const params = Array.from({ length: 4 }).fill(0).map((_, i) => i === index ? '' : (i + 1)).join(',');
						const effect = createArbitraryBaseEffect({ params });
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							value: {
								summonGroup: testCase.property === 'summonGroup' ? testCase.expectedDefault : '1',
								summonId: testCase.property === 'summonId' ? testCase.expectedDefault : '2',
								positionX: testCase.property === 'positionX' ? testCase.expectedDefault : 3,
								positionY: testCase.property === 'positionY' ? testCase.expectedDefault : 4,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				it('returns a no params buff when no parameters are given', () => {
					const effect = createArbitraryBaseEffect();
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('returns a no params buff when summonGroup and summonId are missing', () => {
					const effect = createArbitraryBaseEffect({ params: ',,1,2' });
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('defaults position properties to 0 for non-number values', () => {
					const params = '1,2,not a number,not a number';
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							summonGroup: '1',
							summonId: '2',
							positionX: 0,
							positionY: 0,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: '1,2,3,4,123',
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: { summonGroup: '1', summonId: '2', positionX: 3, positionY: 4 },
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
	});
});
