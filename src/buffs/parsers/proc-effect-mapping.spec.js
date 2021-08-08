const { getProcEffectToBuffMapping } = require('./proc-effect-mapping');
const { BuffId } = require('./buff-types');
const { UnitElement, Ailment, TargetArea, TargetType } = require('../../datamine-types');

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

		const NON_ZERO_ELEMENT_MAPPING = {
			1: UnitElement.Fire,
			2: UnitElement.Water,
			3: UnitElement.Earth,
			4: UnitElement.Thunder,
			5: UnitElement.Light,
			6: UnitElement.Dark,
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
		 * @param {(buff: import('./buff-types').IBuff) => void} arg0.modifyTurnDurationBuff
		 */
		const testTurnDurationScenarios = ({
			createParamsWithZeroValueAndTurnDuration,
			buffIdsInTurnDurationBuff,
			modifyTurnDurationBuff,
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
				if (modifyTurnDurationBuff) {
					modifyTurnDurationBuff(expectedResult[0]);
				}

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
		 * @param {() => import('./buff-types').IBuff[]} context.getAdditionalBuffs
		 * @param {boolean?} context.testHits
		 * @param {(buff: import('./buff-types').IBuff) => void} context.updateExpectedBuffForOnlyHitsOrDistributionCase
		 */
		const testMissingDamageFramesScenarios = ({
			expectedBuffId,
			expectedTargetArea,
			updateExpectedBuffForOnlyHitsOrDistributionCase,
			getAdditionalBuffs,
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
						if (getAdditionalBuffs) {
							expectedResult.push(...getAdditionalBuffs());
						}
						applyTargetAreaAsNeeded(expectedResult[0]);
						if (updateExpectedBuffForOnlyHitsOrDistributionCase) {
							updateExpectedBuffForOnlyHitsOrDistributionCase(expectedResult[0]);
						}

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
						if (getAdditionalBuffs) {
							expectedResult.push(...getAdditionalBuffs());
						}
						applyTargetAreaAsNeeded(expectedResult[0]);
						if (updateExpectedBuffForOnlyHitsOrDistributionCase) {
							updateExpectedBuffForOnlyHitsOrDistributionCase(expectedResult[0]);
						}

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

			if (effectValueKey) {
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
			}

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

		/**
		 * @description Common set of tests for procs that contain only one numerical parameter and turn duration.
		 * @param {object} context
		 * @param {string} context.expectedOriginalId
		 * @param {string} context.expectedBuffId
		 * @param {string} context.effectKeyLow
		 * @param {string} context.effectKeyHigh
		 * @param {string} context.effectKeyChance
		 * @param {string} context.effectTurnDurationKey
		 * @param {string} context.buffKeyLow
		 * @param {string} context.buffKeyHigh
		 * @param {(param: string) => number} context.getExpectedValueFromParam
		 * @param {() => import('./buff-types').IBuffConditions} context.generateConditions
		 */
		const testProcWithProcWithNumericalValueRangeAndChanceAndTurnDuration = ({
			expectedOriginalId,
			expectedBuffId,
			effectKeyLow,
			effectKeyHigh,
			effectKeyChance,
			effectTurnDurationKey = DEFAULT_TURN_DURATION_KEY,
			buffKeyLow,
			buffKeyHigh,
			getExpectedValueFromParam = (param) => +param,
			generateConditions,
		}) => {
			/**
			 * @param {import('./buff-types').IBuff} buffToAddBaseConditions
			 */
			const applyConditionsAsNeeded = (buffToAddBaseConditions) => {
				const conditions = generateConditions && generateConditions();
				if (conditions && Object.keys(conditions).length > 0) {
					buffToAddBaseConditions.conditions = {
						...buffToAddBaseConditions.conditions,
						...conditions,
					};
				}
			};

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
						[buffKeyLow]: getExpectedValueFromParam(100),
						[buffKeyHigh]: getExpectedValueFromParam(200),
						chance: 3,
					},
				})];
				applyConditionsAsNeeded(expectedResult[0]);

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
							[buffKeyLow]: getExpectedValueFromParam(100),
							[buffKeyHigh]: getExpectedValueFromParam(200),
							chance: 3,
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
				applyConditionsAsNeeded(expectedResult[0]);

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[effectKeyLow]: 3,
					[effectKeyHigh]: 4,
					[effectKeyChance]: 5,
					[effectTurnDurationKey]: arbitraryTurnDuration,
				});

				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
					value: {
						[buffKeyLow]: 3,
						[buffKeyHigh]: 4,
						chance: 5,
					},
				})];
				applyConditionsAsNeeded(expectedResult[0]);

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[effectKeyLow]: '6',
					[effectKeyHigh]: '7',
					[effectKeyChance]: '8',
					[effectTurnDurationKey]: '9',
				});

				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 9,
					value: {
						[buffKeyLow]: 6,
						[buffKeyHigh]: 7,
						chance: 8,
					},
				})];
				applyConditionsAsNeeded(expectedResult[0]);

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are missing', () => {
				const effectPropToResultPropMapping = {
					[effectKeyLow]: buffKeyLow,
					[effectKeyHigh]: buffKeyHigh,
					[effectKeyChance]: 'chance',
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
						applyConditionsAsNeeded(expectedResult[0]);

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

				it('returns a no params buff if the effect params are non-number or missing', () => {
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
						value: {
							[buffKeyLow]: getExpectedValueFromParam(100),
							[buffKeyHigh]: getExpectedValueFromParam(200),
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
				applyConditionsAsNeeded(expectedResult[0]);

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 4] });
			});
		};

		describe('proc 51', () => {
			const expectedOriginalId = '51';
			const AILMENTS_ORDER = ['atk', 'def', 'rec'];
			const EFFECT_KEY_VALUE_MAPPING = {
				atk: 'inflict atk% debuff (2)',
				def: 'inflict def% debuff (4)',
				rec: 'inflict rec% debuff (6)',
			};
			const EFFECT_KEY_CHANCE_MAPPING = {
				atk: 'inflict atk% debuff chance% (74)',
				def: 'inflict def% debuff chance% (75)',
				rec: 'inflict rec% debuff chance% (76)',
			};
			const DEBUFF_TURN_EFFECT_KEY = 'stat% debuff turns';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(AILMENTS_ORDER.map((a) => `proc:51:add to attack-${a} down`));

			it('uses the params property when it exists', () => {
				const params = `1,2,3,4,5,6,7,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:51:add to attack-atk down',
						duration: arbitraryTurnDuration,
						value: {
							reductionValue: 1,
							chance: 4,
							debuffTurnDuration: 7,
						},
					}),
					baseBuffFactory({
						id: 'proc:51:add to attack-def down',
						duration: arbitraryTurnDuration,
						value: {
							reductionValue: 2,
							chance: 5,
							debuffTurnDuration: 7,
						},
					}),
					baseBuffFactory({
						id: 'proc:51:add to attack-rec down',
						duration: arbitraryTurnDuration,
						value: {
							reductionValue: 3,
							chance: 6,
							debuffTurnDuration: 7,
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,3,4,5,6,7,${arbitraryTurnDuration},9,10,11`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:51:add to attack-atk down',
						duration: arbitraryTurnDuration,
						value: {
							reductionValue: 1,
							chance: 4,
							debuffTurnDuration: 7,
						},
					}),
					baseBuffFactory({
						id: 'proc:51:add to attack-def down',
						duration: arbitraryTurnDuration,
						value: {
							reductionValue: 2,
							chance: 5,
							debuffTurnDuration: 7,
						},
					}),
					baseBuffFactory({
						id: 'proc:51:add to attack-rec down',
						duration: arbitraryTurnDuration,
						value: {
							reductionValue: 3,
							chance: 6,
							debuffTurnDuration: 7,
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
					[EFFECT_KEY_VALUE_MAPPING.atk]: 1,
					[EFFECT_KEY_CHANCE_MAPPING.atk]: 2,
					[EFFECT_KEY_VALUE_MAPPING.def]: 3,
					[EFFECT_KEY_CHANCE_MAPPING.def]: 4,
					[EFFECT_KEY_VALUE_MAPPING.rec]: 5,
					[EFFECT_KEY_CHANCE_MAPPING.rec]: 6,
					[DEBUFF_TURN_EFFECT_KEY]: 7,
					[DEFAULT_TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:51:add to attack-atk down',
						duration: arbitraryTurnDuration,
						value: {
							reductionValue: 1,
							chance: 2,
							debuffTurnDuration: 7,
						},
					}),
					baseBuffFactory({
						id: 'proc:51:add to attack-def down',
						duration: arbitraryTurnDuration,
						value: {
							reductionValue: 3,
							chance: 4,
							debuffTurnDuration: 7,
						},
					}),
					baseBuffFactory({
						id: 'proc:51:add to attack-rec down',
						duration: arbitraryTurnDuration,
						value: {
							reductionValue: 5,
							chance: 6,
							debuffTurnDuration: 7,
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are 0 or missing', () => {
				AILMENTS_ORDER.forEach((type) => {
					it(`returns an entry for ${type} when its reduction value is the only non-zero value of the individual reduction properties`, () => {
						const params = [
							type === 'atk' ? '123' : '0',
							type === 'def' ? '123' : '0',
							type === 'rec' ? '123' : '0',
							'0,0,0', // chance values of 0
							'0',
							arbitraryTurnDuration,
						].join(',');
						const effect = createArbitraryBaseEffect({ params });
						const expectedResult = [baseBuffFactory({
							id: `proc:51:add to attack-${type} down`,
							duration: arbitraryTurnDuration,
							value: {
								reductionValue: 123,
								chance: 0,
								debuffTurnDuration: 0,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});

					it(`returns an entry for ${type} when its reduction chance is the only non-zero value of the individual reduction properties`, () => {
						const params = [
							'0,0,0', // reduction values of 0
							type === 'atk' ? '123' : '0',
							type === 'def' ? '123' : '0',
							type === 'rec' ? '123' : '0',
							'0',
							arbitraryTurnDuration,
						].join(',');
						const effect = createArbitraryBaseEffect({ params });
						const expectedResult = [baseBuffFactory({
							id: `proc:51:add to attack-${type} down`,
							duration: arbitraryTurnDuration,
							value: {
								reductionValue: 0,
								chance: 123,
								debuffTurnDuration: 0,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});

					it(`returns an entry for ${type} when its reduction value is the only non-zero value of the individual reduction properties and the params property does not exist`, () => {
						const effect = createArbitraryBaseEffect({
							[EFFECT_KEY_VALUE_MAPPING[type]]: 456,
							[DEFAULT_TURN_DURATION_KEY]: arbitraryTurnDuration,
						});
						const expectedResult = [baseBuffFactory({
							id: `proc:51:add to attack-${type} down`,
							duration: arbitraryTurnDuration,
							value: {
								reductionValue: 456,
								chance: 0,
								debuffTurnDuration: 0,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});

					it(`returns an entry for ${type} when its reduction chance is the only non-zero value of the individual reduction properties`, () => {
						const effect = createArbitraryBaseEffect({
							[EFFECT_KEY_CHANCE_MAPPING[type]]: 456,
							[DEFAULT_TURN_DURATION_KEY]: arbitraryTurnDuration,
						});
						const expectedResult = [baseBuffFactory({
							id: `proc:51:add to attack-${type} down`,
							duration: arbitraryTurnDuration,
							value: {
								reductionValue: 0,
								chance: 456,
								debuffTurnDuration: 0,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				describe('for buff duration', () => {
					testTurnDurationScenarios({
						createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,0,0,${duration}`,
						buffIdsInTurnDurationBuff: AILMENTS_ORDER.map((a) => `proc:51:add to attack-${a} down`),
						modifyTurnDurationBuff: (buff) => {
							buff.value.debuffTurnDuration = 0;
						},
					});
				});

				describe('for debuff duration', () => {
					testTurnDurationScenarios({
						createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,0,${duration},0`,
						buffIdsInTurnDurationBuff: AILMENTS_ORDER.map((a) => `proc:51:add to attack-${a} down`),
						modifyTurnDurationBuff: (buff) => {
							buff.value.debuffTurnDuration = buff.value.duration;
							buff.value.duration = 0;
						},
					});
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `1,0,0,0,0,0,0,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:51:add to attack-atk down',
						sources: arbitrarySourceValue,
						duration: arbitraryTurnDuration,
						value: { reductionValue: 1, chance: 0, debuffTurnDuration: 0 },
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

		describe('proc 52', () => {
			testProcWithSingleNumericalParameterAndTurnDuration({
				expectedOriginalId: '52',
				expectedBuffId: 'proc:52:bc efficacy',
				effectValueKey: 'bb gauge fill rate% buff',
				effectTurnDurationKey: 'buff turns (77)',
			});
		});

		describe('proc 53', () => {
			const AILMENTS_ORDER = [Ailment.Poison, Ailment.Weak, Ailment.Sick, Ailment.Injury, Ailment.Curse, Ailment.Paralysis];
			const EFFECT_TURN_DURATION_KEY = 'counter inflict ailment turns';
			const expectedOriginalId = '53';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(AILMENTS_ORDER.map((ailment) => `proc:53:inflict on hit-${ailment}`));

			it('uses the params property when it exists', () => {
				const params = `1,2,3,4,5,6,${arbitraryTurnDuration}`;
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
					return baseBuffFactory({
						id: `proc:53:inflict on hit-${ailment}`,
						duration: arbitraryTurnDuration,
						value: +splitParams[index],
						conditions: { whenAttacked: true },
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
						id: `proc:53:inflict on hit-${ailment}`,
						duration: arbitraryTurnDuration,
						value: +splitParams[index],
						conditions: { whenAttacked: true },
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
					'counter inflict poison% (78)': 7, // the numbers here are from actual data; separate unit tests handle more arbitrary cases
					'counter inflict weaken% (79)': 8,
					'counter inflict sick% (80)': 9,
					'counter inflict injury% (81)': 10,
					'counter inflict curse% (82)': 11,
					'counter inflict paralysis% (83)': 12,
					[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const expectedParamValues = [7, 8, 9, 10, 11, 12];
				const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
					return baseBuffFactory({
						id: `proc:53:inflict on hit-${ailment}`,
						duration: arbitraryTurnDuration,
						value: expectedParamValues[index],
						conditions: { whenAttacked: true },
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
						id: `proc:53:inflict on hit-${ailmentCase}`,
						duration: arbitraryTurnDuration,
						value: 123,
						conditions: { whenAttacked: true },
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`returns only value for ${ailmentCase} if it is non-zero and other stats are zero and params property does not exist`, () => {
					const ailmentKey = ailmentCase !== Ailment.Weak ? ailmentCase : 'weaken';
					const effect = createArbitraryBaseEffect({
						[`counter inflict ${ailmentKey}% (${Math.floor(Math.random() * 100)})`]: 123,
						[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
					});
					const expectedResult = [baseBuffFactory({
						id: `proc:53:inflict on hit-${ailmentCase}`,
						duration: arbitraryTurnDuration,
						value: 123,
						conditions: { whenAttacked: true },
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			describe('when all resistances are 0', () => {
				testTurnDurationScenarios({
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,0,${duration}`,
					buffIdsInTurnDurationBuff: AILMENTS_ORDER.map((ailment) => `proc:53:inflict on hit-${ailment}`),
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `0,0,0,0,0,1,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:53:inflict on hit-paralysis',
						sources: arbitrarySourceValue,
						duration: arbitraryTurnDuration,
						value: 1,
						conditions: { whenAttacked: true },
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

		describe('proc 54', () => {
			testProcWithSingleNumericalParameterAndTurnDuration({
				expectedOriginalId: '54',
				expectedBuffId: 'proc:54:critical damage boost',
				effectValueKey: 'crit multiplier%',
				effectTurnDurationKey: 'buff turns (84)',
				getExpectedValueFromParam: (param) => +param * 100,
			});
		});

		describe('proc 55', () => {
			const EFFECT_MULTIPLIER_KEY = 'elemental weakness multiplier%';
			const EFFECT_TURN_DURATION_KEY = 'elemental weakness buff turns';
			const expectedOriginalId = '55';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(Object.values(NON_ZERO_ELEMENT_MAPPING).concat(['unknown']).map((element) => `proc:55:elemental weakness damage-${element}`));

			it('uses the params property when it exists', () => {
				const params = `1,2,3,4,5,6,7,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = Object.values(NON_ZERO_ELEMENT_MAPPING).map((element) => {
					return baseBuffFactory({
						id: `proc:55:elemental weakness damage-${element}`,
						duration: arbitraryTurnDuration,
						value: 700,
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,3,4,5,6,7,${arbitraryTurnDuration},9,10,11`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = Object.values(NON_ZERO_ELEMENT_MAPPING).map((element) => {
					return baseBuffFactory({
						id: `proc:55:elemental weakness damage-${element}`,
						duration: arbitraryTurnDuration,
						value: 700,
					});
				}).concat([baseBuffFactory({
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
				const valuesInEffect = Object.values(NON_ZERO_ELEMENT_MAPPING).reduce((acc, element) => {
					acc[`${element} units do extra elemental weakness dmg`] = true;
					return acc;
				}, {});
				valuesInEffect[EFFECT_MULTIPLIER_KEY] = 9;
				valuesInEffect[EFFECT_TURN_DURATION_KEY] = arbitraryTurnDuration;
				const effect = createArbitraryBaseEffect(valuesInEffect);
				const expectedResult = Object.values(NON_ZERO_ELEMENT_MAPPING).map((element) => {
					return baseBuffFactory({
						id: `proc:55:elemental weakness damage-${element}`,
						duration: arbitraryTurnDuration,
						value: 9,
					});
				});
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			Object.entries(NON_ZERO_ELEMENT_MAPPING).forEach(([elementKey, elementValue]) => {
				it(`parses value for ${elementValue}`, () => {
					const params = `${elementKey},0,0,0,0,0,123,${arbitraryTurnDuration}`;
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: `proc:55:elemental weakness damage-${elementValue}`,
						duration: arbitraryTurnDuration,
						value: 12300,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`parses value for ${elementValue} when params property does not exist`, () => {
					const effect = createArbitraryBaseEffect({
						[`${elementValue} units do extra elemental weakness dmg`]: true,
						[EFFECT_MULTIPLIER_KEY]: 456,
						[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
					});
					const expectedResult = [baseBuffFactory({
						id: `proc:55:elemental weakness damage-${elementValue}`,
						duration: arbitraryTurnDuration,
						value: 456,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('parses unknown elements to "unknown"', () => {
				const params = `1234,0,0,0,0,0,123,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: 'proc:55:elemental weakness damage-unknown',
					duration: arbitraryTurnDuration,
					value: 12300,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('parses lack of elements to "unknown" when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[EFFECT_MULTIPLIER_KEY]: 456,
					[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const expectedResult = [baseBuffFactory({
					id: 'proc:55:elemental weakness damage-unknown',
					duration: arbitraryTurnDuration,
					value: 456,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when no damage boost value is given', () => {
				testTurnDurationScenarios({
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,0,0,${duration}`,
					buffIdsInTurnDurationBuff: Object.values(NON_ZERO_ELEMENT_MAPPING).concat(['unknown']).map((stat) => `proc:55:elemental weakness damage-${stat}`),
				});

				it('returns a turn modification buff turn duration is non-zero and params property does not exist', () => {
					const effect = createArbitraryBaseEffect({
						[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
					});
					const expectedResult = [baseBuffFactory({
						id: BuffId.TURN_DURATION_MODIFICATION,
						value: {
							buffs: Object.values(NON_ZERO_ELEMENT_MAPPING).concat(['unknown']).map((stat) => `proc:55:elemental weakness damage-${stat}`),
							duration: arbitraryTurnDuration,
						},
					}, [EFFECT_DELAY_BUFF_PROP])];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `5,0,0,0,0,0,1,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:55:elemental weakness damage-light',
						sources: arbitrarySourceValue,
						duration: arbitraryTurnDuration,
						value: 100,
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

		describe('proc 56', () => {
			const expectedBuffId = 'proc:56:chance ko resistance';
			const expectedOriginalId = '56';

			const RECOVERED_HP_BUFF_KEY = 'recoveredHp%';
			const EFFECT_KEY_MAPPING = {
				chance: 'angel idol recover chance%',
				'recoveredHp%': 'angel idol recover hp%',
				turnDuration: 'angel idol buff turns (91)',
			};

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = `1,2,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
					value: { chance: 1, [RECOVERED_HP_BUFF_KEY]: 2 },
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});


			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,${arbitraryTurnDuration},4,5,6`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
						value: { chance: 1, [RECOVERED_HP_BUFF_KEY]: 2 },
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
					[EFFECT_KEY_MAPPING.chance]: 4,
					[EFFECT_KEY_MAPPING['recoveredHp%']]: 5,
					[EFFECT_KEY_MAPPING.turnDuration]: arbitraryTurnDuration,
				});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
					value: { chance: 4, [RECOVERED_HP_BUFF_KEY]: 5 },
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are 0 or missing', () => {
				it('defaults to 0 for missing recovered HP parameter', () => {
					const params = `1,,${arbitraryTurnDuration}`;
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
						value: { chance: 1, [RECOVERED_HP_BUFF_KEY]: 0 },
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for missing recovered HP parameter when params property does not exist', () => {
					const effect = createArbitraryBaseEffect({
						[EFFECT_KEY_MAPPING.chance]: 4,
						[EFFECT_KEY_MAPPING.turnDuration]: arbitraryTurnDuration,
					});
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
						value: { chance: 4, [RECOVERED_HP_BUFF_KEY]: 0 },
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a no params buff if chance is 0 and turn duration is 0', () => {
					const params = '0,1,0';
					const effect = createArbitraryBaseEffect({ params });

					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('returns a no params buff if chance is 0 and turn duration is 0 and params property does not exist', () => {
					const effect = createArbitraryBaseEffect({
						[EFFECT_KEY_MAPPING.chance]: 0,
						[EFFECT_KEY_MAPPING['recoveredHp%']]: 5,
						[EFFECT_KEY_MAPPING.turnDuration]: 0,
					});
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				testTurnDurationScenarios({
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,${duration}`,
					buffIdsInTurnDurationBuff: [expectedBuffId],
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `1,2,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						duration: arbitraryTurnDuration,
						value: { chance: 1, [RECOVERED_HP_BUFF_KEY]: 2 },
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

		describe('proc 57', () => {
			const BUFF_ID_MAPPING = {
				bcDropResistanceBase: 'proc:57:bc drop resistance-base',
				bcDropResistanceBuff: 'proc:57:bc drop resistance-buff',
				hcDropResistanceBase: 'proc:57:hc drop resistance-base',
				hcDropResistanceBuff: 'proc:57:hc drop resistance-buff',
			};
			const EFFECT_KEY_MAPPING = {
				bcDropResistanceBase: 'base bc drop% resist buff',
				bcDropResistanceBuff: 'buffed bc drop% resist buff',
				turnDuration: 'bc drop% resist buff turns (92)',
				// Deathmax's datamine doesn't parse HC resistance buffs
			};
			const PARAMS_ORDER = ['bcDropResistanceBase', 'bcDropResistanceBuff', 'hcDropResistanceBase', 'hcDropResistanceBuff'];
			const expectedOriginalId = '57';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(PARAMS_ORDER.map((k) => BUFF_ID_MAPPING[k]));

			it('uses the params property when it exists', () => {
				const params = `1,2,3,4,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: BUFF_ID_MAPPING.bcDropResistanceBase,
						duration: arbitraryTurnDuration,
						value: 1,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.bcDropResistanceBuff,
						duration: arbitraryTurnDuration,
						value: 2,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.hcDropResistanceBase,
						duration: arbitraryTurnDuration,
						value: 3,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.hcDropResistanceBuff,
						duration: arbitraryTurnDuration,
						value: 4,
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,3,4,${arbitraryTurnDuration},6,7,8`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: BUFF_ID_MAPPING.bcDropResistanceBase,
						duration: arbitraryTurnDuration,
						value: 1,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.bcDropResistanceBuff,
						duration: arbitraryTurnDuration,
						value: 2,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.hcDropResistanceBase,
						duration: arbitraryTurnDuration,
						value: 3,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.hcDropResistanceBuff,
						duration: arbitraryTurnDuration,
						value: 4,
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
					[EFFECT_KEY_MAPPING.bcDropResistanceBase]: 6,
					[EFFECT_KEY_MAPPING.bcDropResistanceBuff]: 7,
					[EFFECT_KEY_MAPPING.turnDuration]: arbitraryTurnDuration,
				});

				const expectedResult = [
					baseBuffFactory({
						id: BUFF_ID_MAPPING.bcDropResistanceBase,
						duration: arbitraryTurnDuration,
						value: 6,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.bcDropResistanceBuff,
						duration: arbitraryTurnDuration,
						value: 7,
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('for missing or 0 values', () => {
				PARAMS_ORDER.forEach((key, index) => {
					it(`returns a single buff for ${BUFF_ID_MAPPING[key]} if it's the only drop resistance parameter that is non-zero`, () => {
						const params = Array.from({ length: PARAMS_ORDER.length }).fill(0).map((_, i) => i !== index ? '0' : '123').concat([arbitraryTurnDuration]).join(',');
						const effect = createArbitraryBaseEffect({ params });
						const expectedResult = [baseBuffFactory({
							id: BUFF_ID_MAPPING[key],
							duration: arbitraryTurnDuration,
							value: 123,
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});

					if (key in EFFECT_KEY_MAPPING) {
						it(`returns a single buff for ${BUFF_ID_MAPPING[key]} if it's the only drop resistance parameter that is non-zero and the params property does not exist`, () => {
							const effect = createArbitraryBaseEffect({
								[EFFECT_KEY_MAPPING[key]]: 456,
								[EFFECT_KEY_MAPPING.turnDuration]: arbitraryTurnDuration,
							});
							const expectedResult = [baseBuffFactory({
								id: BUFF_ID_MAPPING[key],
								duration: arbitraryTurnDuration,
								value: 456,
							})];

							const result = mappingFunction(effect, createArbitraryContext());
							expect(result).toEqual(expectedResult);
						});
					}
				});

				describe('when drop resistance parameters are 0', () => {
					testTurnDurationScenarios({
						createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,${duration}`,
						buffIdsInTurnDurationBuff: PARAMS_ORDER.map((k) => BUFF_ID_MAPPING[k]),
					});
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `1,0,0,0,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: BUFF_ID_MAPPING.bcDropResistanceBase,
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 5] });
			});
		});

		describe('proc 58', () => {
			const expectedBuffId = 'proc:58:spark vulnerability';
			const expectedOriginalId = '58';

			const DAMAGE_BUFF_KEY = 'sparkDamage%';
			const EFFECT_KEY_MAPPING = {
				'sparkDamage%': 'spark dmg% received',
				chance: 'spark dmg received apply%',
				turnDuration: 'spark dmg received debuff turns (94)',
			};

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = `1,2,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
					value: { [DAMAGE_BUFF_KEY]: 1, chance: 2 },
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});


			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,${arbitraryTurnDuration},4,5,6`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
						value: { [DAMAGE_BUFF_KEY]: 1, chance: 2 },
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
					[EFFECT_KEY_MAPPING.chance]: 4,
					[EFFECT_KEY_MAPPING['sparkDamage%']]: 5,
					[EFFECT_KEY_MAPPING.turnDuration]: arbitraryTurnDuration,
				});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
					value: { chance: 4, [DAMAGE_BUFF_KEY]: 5 },
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are 0 or missing', () => {
				it('defaults to 0 for missing damage parameter', () => {
					const params = `,1,${arbitraryTurnDuration}`;
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
						value: { chance: 1, [DAMAGE_BUFF_KEY]: 0 },
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for missing damage parameter when params property does not exist', () => {
					const effect = createArbitraryBaseEffect({
						[EFFECT_KEY_MAPPING.chance]: 4,
						[EFFECT_KEY_MAPPING.turnDuration]: arbitraryTurnDuration,
					});
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
						value: { chance: 4, [DAMAGE_BUFF_KEY]: 0 },
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a no params buff if chance is 0 and turn duration is 0', () => {
					const params = '1,0,0';
					const effect = createArbitraryBaseEffect({ params });

					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('returns a no params buff if chance is 0 and turn duration is 0 and params property does not exist', () => {
					const effect = createArbitraryBaseEffect({
						[EFFECT_KEY_MAPPING.chance]: 0,
						[EFFECT_KEY_MAPPING['sparkDamage%']]: 5,
						[EFFECT_KEY_MAPPING.turnDuration]: 0,
					});
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				testTurnDurationScenarios({
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,${duration}`,
					buffIdsInTurnDurationBuff: [expectedBuffId],
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `1,2,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						duration: arbitraryTurnDuration,
						value: { [DAMAGE_BUFF_KEY]: 1, chance: 2 },
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

		describe('proc 59', () => {
			const BURST_TYPES = ['bb', 'sbb', 'ubb'];
			const expectedOriginalId = '59';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(BURST_TYPES.map((type) => `proc:59:attack reduction-${type}`));

			it('uses the params property when it exists', () => {
				const params = `1,2,3,${arbitraryTurnDuration}`;
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = BURST_TYPES.map((type, index) => {
					return baseBuffFactory({
						id: `proc:59:attack reduction-${type}`,
						duration: arbitraryTurnDuration,
						value: +splitParams[index],
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,3,${arbitraryTurnDuration},5,6,7`;
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = BURST_TYPES.map((type, index) => {
					return baseBuffFactory({
						id: `proc:59:attack reduction-${type}`,
						duration: arbitraryTurnDuration,
						value: +splitParams[index],
					});
				}).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
					value: {
						param_4: '5',
						param_5: '6',
						param_6: '7',
					},
				})]);

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to unknown proc params property when params property does not exist', () => {
				const params = `5,6,7,${arbitraryTurnDuration}`;
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ 'unknown proc param': params });
				const expectedResult = BURST_TYPES.map((type, index) => {
					return baseBuffFactory({
						id: `proc:59:attack reduction-${type}`,
						duration: arbitraryTurnDuration,
						value: +splitParams[index],
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			BURST_TYPES.forEach((burstCase) => {
				it(`returns only value for ${burstCase} if it is non-zero and other non-turn values are 0`, () => {
					const params = [...BURST_TYPES.map((type) => type === burstCase ? '123' : '0'), arbitraryTurnDuration].join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: `proc:59:attack reduction-${burstCase}`,
						duration: arbitraryTurnDuration,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			describe('when all stats are 0', () => {
				testTurnDurationScenarios({
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,${duration}`,
					buffIdsInTurnDurationBuff: BURST_TYPES.map((type) => `proc:59:attack reduction-${type}`),
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `0,0,1,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:59:attack reduction-ubb',
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

		describe('proc 61', () => {
			const ADDED_ATK_BUFF_KEY = 'maxAddedAtk%';
			const PARAMS_ORDER = ['baseAtk%', ADDED_ATK_BUFF_KEY, 'flatAtk', 'crit%', 'bc%', 'hc%', 'dmg%'];
			const expectedBuffIdForAttack = 'proc:61:party bb gauge-scaled attack';
			const expectedBuffIdForBcDrain = 'proc:61:party bc drain';
			const expectedOriginalId = '61';

			const createExpectedBcDrainBuff = () => baseBuffFactory({
				id: expectedBuffIdForBcDrain,
				value: true,
				targetArea: TargetArea.Aoe,
				targetType: TargetType.Party,
			});

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffIdForAttack, expectedBuffIdForBcDrain]);

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6,7';
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
						id: expectedBuffIdForAttack,
						value: {
							...expectedValuesForParams,
							hits: arbitraryHitCount,
							distribution: arbitraryDamageDistribution,
						},
					}),
					createExpectedBcDrainBuff(),
				];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,6,7,8,9,10';
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
						id: expectedBuffIdForAttack,
						value: {
							...expectedValuesForParams,
							hits: arbitraryHitCount,
							distribution: arbitraryDamageDistribution,
						},
					}),
					createExpectedBcDrainBuff(),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						value: {
							param_7: '8',
							param_8: '9',
							param_9: '10',
						},
					}),
				];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const mockValues = [7, 8, 9, 10, 11, 12, 13];
				const valuesInEffect = PARAMS_ORDER.reduce((acc, stat, index) => {
					let key;
					if (stat === 'flatAtk') {
						key = 'bb flat atk';
					} else if (stat === 'baseAtk%') {
						key = 'bb base atk%';
					} else if (stat === ADDED_ATK_BUFF_KEY) {
						key = 'bb max atk% based on ally bb gauge and clear bb gauges';
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
					acc[param] = mockValues[index];
					return acc;
				}, {});
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForAttack,
						value: {
							...expectedValuesForParams,
							hits: arbitraryHitCount,
							distribution: arbitraryDamageDistribution,
						},
					}),
					createExpectedBcDrainBuff(),
				];


				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			testMissingDamageFramesScenarios({
				expectedBuffId: expectedBuffIdForAttack,
				getAdditionalBuffs: () => [createExpectedBcDrainBuff()],
			});

			PARAMS_ORDER.forEach((paramCase) => {
				it(`returns associated values for ${paramCase} if it is non-zero and other stats are zero`, () => {
					const params = PARAMS_ORDER.map((param) => param === paramCase ? '123' : '0').join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [
						baseBuffFactory({
							id: expectedBuffIdForAttack,
							value: {
								[paramCase]: 123,
								hits: 0,
								distribution: 0,
							},
						}),
						createExpectedBcDrainBuff(),
					];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`returns associated values for ${paramCase} if it is non-zero and other stats are zero and params property does not exist`, () => {
					const valuesInEffect = PARAMS_ORDER.reduce((acc, stat) => {
						let key;
						if (stat === 'flatAtk') {
							key = 'bb flat atk';
						} else if (stat === 'baseAtk%') {
							key = 'bb base atk%';
						} else if (stat === ADDED_ATK_BUFF_KEY) {
							key = 'bb max atk% based on ally bb gauge and clear bb gauges';
						}  else {
							key = `bb ${stat}`;
						}
						acc[key] = stat === paramCase ? 789 : 0;
						return acc;
					}, {});
					const effect = createArbitraryBaseEffect(valuesInEffect);
					const expectedResult = [
						baseBuffFactory({
							id: expectedBuffIdForAttack,
							value: {
								[paramCase]: 789,
								hits: 0,
								distribution: 0,
							},
						}),
						createExpectedBcDrainBuff(),
					];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({ params: '0,0,1,0,0,0,0,123' });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForAttack,
						sources: arbitrarySourceValue,
						value: { flatAtk: 1, hits: 0, distribution: 0 },
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: expectedBuffIdForBcDrain,
						sources: arbitrarySourceValue,
						value: true,
						targetArea: TargetArea.Aoe,
						targetType: TargetType.Party,
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 7] });
			});
		});

		describe('proc 62', () => {
			const expectedOriginalId = '62';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(Object.values(ELEMENT_MAPPING).concat(['unknown']).map((element) => `proc:62:barrier-${element}`));

			it('uses the params property when it exists', () => {
				const params = '0,1,2,3';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: 'proc:62:barrier-all',
					value: {
						hp: 1,
						defense: 2,
						'damageAbsorption%': 3,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,6,7';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:62:barrier-fire',
						value: {
							hp: 2,
							defense: 3,
							'damageAbsorption%': 4,
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
					'elemental barrier element': 'water',
					'elemental barrier hp': 6,
					'elemental barrier def': 7,
					'elemental barrier absorb dmg%': 8,
				});
				const expectedResult = [baseBuffFactory({
					id: 'proc:62:barrier-water',
					value: {
						hp: 6,
						defense: 7,
						'damageAbsorption%': 8,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when parsing element parameter', () => {
				Object.entries(ELEMENT_MAPPING).forEach(([elementKey, elementValue]) => {
					it(`parses value for ${elementValue}`, () => {
						const params = `${elementKey},1,2,3`;
						const effect = createArbitraryBaseEffect({ params });
						const expectedResult = [baseBuffFactory({
							id: `proc:62:barrier-${elementValue}`,
							value: {
								hp: 1,
								defense: 2,
								'damageAbsorption%': 3,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});

					it(`parses value for ${elementValue} when params property does not exist`, () => {
						const effect = createArbitraryBaseEffect({
							'elemental barrier element': elementValue,
							'elemental barrier hp': 4,
							'elemental barrier def': 5,
							'elemental barrier absorb dmg%': 6,
						});
						const expectedResult = [baseBuffFactory({
							id: `proc:62:barrier-${elementValue}`,
							value: {
								hp: 4,
								defense: 5,
								'damageAbsorption%': 6,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				it('parses unknown elements to "unknown"', () => {
					const params = '1234,1,2,3';
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: 'proc:62:barrier-unknown',
						value: {
							hp: 1,
							defense: 2,
							'damageAbsorption%': 3,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('parses unknown elements to "unknown" when params property does not exist', () => {
					const effect = createArbitraryBaseEffect({
						'elemental barrier element': 'arbitrary element',
						'elemental barrier hp': 4,
						'elemental barrier def': 5,
						'elemental barrier absorb dmg%': 6,
					});
					const expectedResult = [baseBuffFactory({
						id: 'proc:62:barrier-unknown',
						value: {
							hp: 4,
							defense: 5,
							'damageAbsorption%': 6,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('parses missing element property to "unknown" when params property does not exist', () => {
					const effect = createArbitraryBaseEffect({
						'elemental barrier hp': 7,
						'elemental barrier def': 8,
						'elemental barrier absorb dmg%': 9,
					});
					const expectedResult = [baseBuffFactory({
						id: 'proc:62:barrier-unknown',
						value: {
							hp: 7,
							defense: 8,
							'damageAbsorption%': 9,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			describe('when non-elemental parameters are missing or 0', () => {
				const NON_ELEMENTAL_EFFECT_KEY_TO_BUFF_KEY_MAPPING = {
					'elemental barrier hp': 'hp',
					'elemental barrier def': 'defense',
					'elemental barrier absorb dmg%': 'damageAbsorption%',
				};
				Object.keys(NON_ELEMENTAL_EFFECT_KEY_TO_BUFF_KEY_MAPPING).forEach(([buffKey]) => {
					it(`defaults to 0 for non-number ${buffKey} parameter`, () => {
						const params = [
							'0',
							buffKey !== 'hp' ? '123' : 'not a number',
							buffKey !== 'defense' ? '123' : 'not a number',
							buffKey !== 'damageAbsorption%' ? '123' : 'not a number',
						].join(',');
						const effect = createArbitraryBaseEffect({ params });
						const expectedResult = [baseBuffFactory({
							id: 'proc:62:barrier-all',
							value: {
								hp: buffKey !== 'hp' ? 123 : 0,
								defense: buffKey !== 'defense' ? 123 : 0,
								'damageAbsorption%': buffKey !== 'damageAbsorption%' ? 123 : 0,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});

					it(`defaults to 0 for non-number ${buffKey} parameter when params property does not exist`, () => {
						const valuesInEffect = Object.entries(NON_ELEMENTAL_EFFECT_KEY_TO_BUFF_KEY_MAPPING).reduce((acc, [localEffectKey, localBuffKey]) => {
							acc[localEffectKey] = localBuffKey !== buffKey ? 456 : 'not a number';
							return acc;
						}, {});
						const effect = createArbitraryBaseEffect({
							'elemental barrier element': 'all',
							...valuesInEffect,
						});
						const expectedResult = [baseBuffFactory({
							id: 'proc:62:barrier-all',
							value: {
								hp: buffKey !== 'hp' ? 456 : 0,
								defense: buffKey !== 'defense' ? 456 : 0,
								'damageAbsorption%': buffKey !== 'damageAbsorption%' ? 456 : 0,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});

					it(`defaults to 0 for missing ${buffKey} parameter when params property does not exist`, () => {
						const valuesInEffect = Object.entries(NON_ELEMENTAL_EFFECT_KEY_TO_BUFF_KEY_MAPPING).reduce((acc, [localEffectKey, localBuffKey]) => {
							if (localBuffKey !== buffKey) {
								acc[localEffectKey] =  789;
							}
							return acc;
						}, {});
						const effect = createArbitraryBaseEffect({
							'elemental barrier element': 'all',
							...valuesInEffect,
						});
						const expectedResult = [baseBuffFactory({
							id: 'proc:62:barrier-all',
							value: {
								hp: buffKey !== 'hp' ? 789 : 0,
								defense: buffKey !== 'defense' ? 789 : 0,
								'damageAbsorption%': buffKey !== 'damageAbsorption%' ? 789 : 0,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});

					it('returns a no params buff if all non-elemental parameters are 0', () => {
						const effect = createArbitraryBaseEffect({ params: '1,0,0,0' });
						expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
					});

					it('returns a no params buff no parameters are given and params property does not exist', () => {
						expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
					});
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: '0,1,2,3,123',
				});
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:62:barrier-all',
						sources: arbitrarySourceValue,
						value: {
							hp: 1,
							defense: 2,
							'damageAbsorption%': 3,
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

		describe('proc 64', () => {
			const PARAMS_ORDER = ['atk%', 'addedAtkPerUse%', 'maxIncreases', 'flatAtk', 'crit%', 'bc%', 'hc%', 'dmg%'];
			const expectedBuffId = 'proc:64:consecutive usage attack';
			const expectedOriginalId = '64';

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
					} else if (stat === 'addedAtkPerUse%') {
						key = 'bb atk% inc per use';
					} else if (stat === 'maxIncreases') {
						key = 'bb atk% max number of inc';
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
				const effect = createArbitraryBaseEffect({ params: '0,0,0,1,0,0,0,0,123' });
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

		describe('proc 65', () => {
			testProcWithSingleNumericalParameterAndTurnDuration({
				expectedOriginalId: '65',
				expectedBuffId: 'proc:65:ailment attack boost',
				effectValueKey: 'atk% buff when enemy has ailment',
				effectTurnDurationKey: 'atk% buff turns (110)',
			});
		});

		describe('proc 66', () => {
			const expectedBuffId = 'proc:66:chance revive';
			const expectedOriginalId = '66';

			const HP_BUFF_KEY = 'reviveToHp%';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = '1,2';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						[HP_BUFF_KEY]: 1,
						chance: 2,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: {
							[HP_BUFF_KEY]: 1,
							chance: 2,
						},
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
					'revive unit hp%': 3,
					'revive unit chance%': 4,
				});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						[HP_BUFF_KEY]: 3,
						chance: 4,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					'revive unit hp%': '5',
					'revive unit chance%': '6',
				});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						[HP_BUFF_KEY]: 5,
						chance: 6,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are missing or 0', () => {
				it('defaults to 0 for non-number hp parameter', () => {
					const params = ',2';
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							[HP_BUFF_KEY]: 0,
							chance: 2,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for non-number hp parameter when params property does not exist', () => {
					const effect = createArbitraryBaseEffect({
						'revive unit hp%': 'not a number',
						'revive unit chance%': 4,
					});
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							[HP_BUFF_KEY]: 0,
							chance: 4,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for missing hp parameter when params property does not exist', () => {
					const effect = createArbitraryBaseEffect({
						'revive unit chance%': 6,
					});
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							[HP_BUFF_KEY]: 0,
							chance: 6,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a no params buff when no parameters are given', () => {
					const effect = createArbitraryBaseEffect();
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('returns a no params buff when chance is 0', () => {
					const params = '123,0';
					const effect = createArbitraryBaseEffect({ params });
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('returns a no params buff when chance is 0 and params property does not exist', () => {
					const effect = createArbitraryBaseEffect({
						'revive unit hp%': 456,
						'revive unit chance%': 0,
					});
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: '1,2,123',
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: {
							[HP_BUFF_KEY]: 1,
							chance: 2,
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 2] });
			});
		});

		describe('proc 67', () => {
			testProcWithProcWithNumericalValueRangeAndChanceAndTurnDuration({
				expectedOriginalId: '67',
				expectedBuffId: 'proc:67:bc fill on spark',
				effectKeyLow: 'bc fill on spark low',
				effectKeyHigh: 'bc fill on spark high',
				effectKeyChance: 'bc fill on spark%',
				effectTurnDurationKey: 'bc fill on spark buff turns (111)',
				buffKeyLow: 'fillLow',
				buffKeyHigh: 'fillHigh',
				getExpectedValueFromParam: (param) => +param / 100,
			});
		});

		describe('proc 68', () => {
			testProcWithSingleNumericalParameterAndTurnDuration({
				expectedOriginalId: '68',
				expectedBuffId: 'proc:68:guard mitigation',
				effectValueKey: 'guard increase mitigation%',
				effectTurnDurationKey: 'guard increase mitigation buff turns (113)',
			});
		});

		describe('proc 69', () => {
			const expectedFlatFillId = 'proc:69:bc fill on guard-flat';
			const expectedPercentFillId = 'proc:69:bc fill on guard-percent';
			const FLAT_FILL_KEY = 'bb bc fill on guard';
			const PERCENT_FILL_KEY = 'bb bc fill% on guard';
			const EFFECT_TURN_DURATION_KEY = 'bb bc fill on guard buff turns (114)';
			const expectedOriginalId = '69';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedFlatFillId, expectedPercentFillId]);

			it('uses the params property when it exists', () => {
				const params = `100,2,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatFillId,
						duration: arbitraryTurnDuration,
						value: 1,
						conditions: {
							onGuard: true,
						},
					}),
					baseBuffFactory({
						id: expectedPercentFillId,
						duration: arbitraryTurnDuration,
						value: 2,
						conditions: {
							onGuard: true,
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `100,2,${arbitraryTurnDuration},4,5,6`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatFillId,
						value: 1,
						duration: arbitraryTurnDuration,
						conditions: {
							onGuard: true,
						},
					}),
					baseBuffFactory({
						id: expectedPercentFillId,
						value: 2,
						duration: arbitraryTurnDuration,
						conditions: {
							onGuard: true,
						},
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
					[FLAT_FILL_KEY]: 4,
					[PERCENT_FILL_KEY]: 5,
					[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatFillId,
						duration: arbitraryTurnDuration,
						value: 4,
						conditions: {
							onGuard: true,
						},
					}),
					baseBuffFactory({
						id: expectedPercentFillId,
						duration: arbitraryTurnDuration,
						value: 5,
						conditions: {
							onGuard: true,
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[FLAT_FILL_KEY]: '6',
					[PERCENT_FILL_KEY]: '7',
					[EFFECT_TURN_DURATION_KEY]: '8',
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatFillId,
						duration: 8,
						value: 6,
						conditions: {
							onGuard: true,
						},
					}),
					baseBuffFactory({
						id: expectedPercentFillId,
						duration: 8,
						value: 7,
						conditions: {
							onGuard: true,
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are missing', () => {
				it('returns only buff for percent fill if flat fill value is 0', () => {
					const params = `0,123,${arbitraryTurnDuration}`;
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [
						baseBuffFactory({
							id: expectedPercentFillId,
							duration: arbitraryTurnDuration,
							value: 123,
							conditions: {
								onGuard: true,
							},
						}),
					];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns only buff for flat fill if percent fill value is 0', () => {
					const params = `12300,0,${arbitraryTurnDuration}`;
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [
						baseBuffFactory({
							id: expectedFlatFillId,
							duration: arbitraryTurnDuration,
							value: 123,
							conditions: {
								onGuard: true,
							},
						}),
					];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns only buff for percent fill if flat fill value is 0 and params property does not exist', () => {
					const effect = createArbitraryBaseEffect({
						[FLAT_FILL_KEY]: 0,
						[PERCENT_FILL_KEY]: 123,
						[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
					});
					const expectedResult = [
						baseBuffFactory({
							id: expectedPercentFillId,
							duration: arbitraryTurnDuration,
							value: 123,
							conditions: {
								onGuard: true,
							},
						}),
					];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns only buff for flat fill if percent fill value is 0 and params property does not exist', () => {
					const effect = createArbitraryBaseEffect({
						[FLAT_FILL_KEY]: 123,
						[PERCENT_FILL_KEY]: 0,
						[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
					});
					const expectedResult = [
						baseBuffFactory({
							id: expectedFlatFillId,
							duration: arbitraryTurnDuration,
							value: 123,
							conditions: {
								onGuard: true,
							},
						}),
					];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns only buff for percent fill if flat fill value is missing and params property does not exist', () => {
					const effect = createArbitraryBaseEffect({
						[PERCENT_FILL_KEY]: 123,
						[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
					});
					const expectedResult = [
						baseBuffFactory({
							id: expectedPercentFillId,
							duration: arbitraryTurnDuration,
							value: 123,
							conditions: {
								onGuard: true,
							},
						}),
					];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns only buff for flat fill if percent fill value is missing and params property does not exist', () => {
					const effect = createArbitraryBaseEffect({
						[FLAT_FILL_KEY]: 123,
						[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
					});
					const expectedResult = [
						baseBuffFactory({
							id: expectedFlatFillId,
							duration: arbitraryTurnDuration,
							value: 123,
							conditions: {
								onGuard: true,
							},
						}),
					];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a no params buff when no parameters are given', () => {
					const effect = createArbitraryBaseEffect();
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			describe('when both flat fill and percent fill values are 0', () => {
				testTurnDurationScenarios({
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,${duration}`,
					buffIdsInTurnDurationBuff: [expectedFlatFillId, expectedPercentFillId],
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `100,2,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatFillId,
						sources: arbitrarySourceValue,
						duration: arbitraryTurnDuration,
						value: 1,
						conditions: {
							onGuard: true,
						},
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: expectedPercentFillId,
						sources: arbitrarySourceValue,
						duration: arbitraryTurnDuration,
						value: 2,
						conditions: {
							onGuard: true,
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 3] });
			});
		});

		describe('proc 71', () => {
			testProcWithSingleNumericalParameterAndTurnDuration({
				expectedOriginalId: '71',
				expectedBuffId: 'proc:71:bc efficacy reduction',
				effectValueKey: 'bb fill inc%',
				effectTurnDurationKey: 'bb fill inc buff turns (112)',
			});
		});

		describe('proc 73', () => {
			const AILMENTS_ORDER = [Ailment.AttackReduction, Ailment.DefenseReduction, Ailment.RecoveryReduction];
			const EFFECT_TURN_DURATION_KEY = 'stat down immunity buff turns';
			const expectedOriginalId = '73';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(AILMENTS_ORDER.map((ailment) => `proc:73:resist-${ailment}`));

			it('uses the params property when it exists', () => {
				const params = `1,2,3,${arbitraryTurnDuration}`;
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
					return baseBuffFactory({
						id: `proc:73:resist-${ailment}`,
						duration: arbitraryTurnDuration,
						value: +splitParams[index],
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,3,${arbitraryTurnDuration},5,6,7`;
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
					return baseBuffFactory({
						id: `proc:73:resist-${ailment}`,
						duration: arbitraryTurnDuration,
						value: +splitParams[index],
					});
				}).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
					value: {
						param_4: '5',
						param_5: '6',
						param_6: '7',
					},
				})]);

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					'atk down resist% (120)': 5, // the numbers here are from actual data; separate unit tests handle more arbitrary cases
					'def down resist% (121)': 6,
					'rec down resist% (122)': 7,
					[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const expectedParamValues = [5, 6, 7];
				const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
					return baseBuffFactory({
						id: `proc:73:resist-${ailment}`,
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
						id: `proc:73:resist-${ailmentCase}`,
						duration: arbitraryTurnDuration,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`returns only value for ${ailmentCase} if it is non-zero and other stats are zero and params property does not exist`, () => {
					const ailmentKey = ailmentCase !== Ailment.Weak ? ailmentCase : 'weaken';
					const effect = createArbitraryBaseEffect({
						[`${ailmentKey} resist% (${Math.floor(Math.random() * 100)})`]: 123,
						[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
					});
					const expectedResult = [baseBuffFactory({
						id: `proc:73:resist-${ailmentCase}`,
						duration: arbitraryTurnDuration,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			describe('when all resistances are 0', () => {
				testTurnDurationScenarios({
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,${duration}`,
					buffIdsInTurnDurationBuff: AILMENTS_ORDER.map((ailment) => `proc:73:resist-${ailment}`),
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `0,0,1,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:73:resist-rec down',
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

		describe('proc 75', () => {
			const PARAMS_ORDER = ['baseAtk%', 'addedAttackPerUnitWithMatchingElement%', 'flatAtk', 'crit%', 'bc%', 'hc%', 'dmg%'];
			const BUFF_KEY_TO_EFFECT_KEY_MAPPING = {
				elementToMatch: 'counted element for buff multiplier',
				'baseAtk%': 'atk% buff (1)',
				'addedAttackPerUnitWithMatchingElement%': 'def% buff (3)',
				flatAtk: 'rec% buff (5)',
				'crit%': 'crit% buff (7)',
				'bc%': 'buff turns',
			};
			const expectedBuffId = 'proc:75:element squad-scaled attack';
			const expectedOriginalId = '75';

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
					acc[param] = +splitParams[index + 1];
					return acc;
				}, {});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						...expectedValuesForParams,
						elementToMatch: 'fire',
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
					acc[param] = +splitParams[index + 1];
					return acc;
				}, {});
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: {
							...expectedValuesForParams,
							elementToMatch: 'fire',
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
				const mockValues = [9, 10, 11, 12, 13, 14];
				const valuesInEffect = PARAMS_ORDER.reduce((acc, param, index) => {
					if (param in BUFF_KEY_TO_EFFECT_KEY_MAPPING) {
						const key = BUFF_KEY_TO_EFFECT_KEY_MAPPING[param];
						acc[key] = mockValues[index];
					}
					return acc;
				}, {});
				valuesInEffect[BUFF_KEY_TO_EFFECT_KEY_MAPPING.elementToMatch] = 'arbitrary element'; // taken at face vlaue
				const effect = createArbitraryBaseEffect(valuesInEffect);
				const context = createArbitraryContext({
					damageFrames: {
						hits: arbitraryHitCount,
						[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: arbitraryDamageDistribution,
					},
				});
				const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
					if (param in BUFF_KEY_TO_EFFECT_KEY_MAPPING) {
						acc[param] = +mockValues[index];
					}
					return acc;
				}, {});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						...expectedValuesForParams,
						elementToMatch: 'arbitrary element',
						hits: arbitraryHitCount,
						distribution: arbitraryDamageDistribution,
					},
				})];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			testMissingDamageFramesScenarios({
				expectedBuffId,
				updateExpectedBuffForOnlyHitsOrDistributionCase: (buff) => {
					buff.value.elementToMatch = 'unknown';
				},
			});

			PARAMS_ORDER.forEach((paramCase) => {
				it(`returns only value for ${paramCase} if it is non-zero and other stats are zero`, () => {
					const params = ['1'].concat((PARAMS_ORDER.map((param) => param === paramCase ? '789' : '0'))).join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							[paramCase]: 789,
							elementToMatch: 'fire',
							hits: 0,
							distribution: 0,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				if (paramCase in BUFF_KEY_TO_EFFECT_KEY_MAPPING) {
					it(`returns only value for ${paramCase} if it is non-zero and other stats are zero and params property does not exist`, () => {
						const effect = createArbitraryBaseEffect({
							[BUFF_KEY_TO_EFFECT_KEY_MAPPING[paramCase]]: 456,
							[BUFF_KEY_TO_EFFECT_KEY_MAPPING.elementToMatch]: 'arbitrary element',
						});
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							value: {
								[paramCase]: 456,
								elementToMatch: 'arbitrary element',
								hits: 0,
								distribution: 0,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				}
			});

			Object.entries(ELEMENT_MAPPING).forEach(([elementKey, elementValue]) => {
				it(`parses element parameter [${elementKey}] as [${elementValue}]`, () => {
					const params = [elementKey].concat((PARAMS_ORDER.map((_, index) => index + 1))).join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
						acc[param] = index + 1;
						return acc;
					}, {});
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							...expectedValuesForParams,
							elementToMatch: elementValue,
							hits: 0,
							distribution: 0,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('parses element parameters with no mapping as "unknown"', () => {
				const params = [123].concat((PARAMS_ORDER.map((_, index) => index + 1))).join(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
					acc[param] = index + 1;
					return acc;
				}, {});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						...expectedValuesForParams,
						elementToMatch: 'unknown',
						hits: 0,
						distribution: 0,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('parses lack of element property as "unknown" when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({ [BUFF_KEY_TO_EFFECT_KEY_MAPPING.flatAtk]: 123 });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						flatAtk: 123,
						elementToMatch: 'unknown',
						hits: 0,
						distribution: 0,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({ params: '0,0,0,1,0,0,0,0,123' });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: { flatAtk: 1, elementToMatch: 'all', hits: 0, distribution: 0 },
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

		describe('proc 76', () => {
			const expectedBuffId = 'proc:76:extra action';
			const expectedOriginalId = '76';

			const EFFECT_KEY_MAPPING = {
				maxExtraActions: 'max number of extra actions',
				chance: 'chance% for extra action',
				turnDuration: 'extra action buff turns (123)',
			};

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = `1,2,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
					value: { maxExtraActions: 1, chance: 2 },
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,${arbitraryTurnDuration},4,5,6`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
						value: { maxExtraActions: 1, chance: 2 },
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
					[EFFECT_KEY_MAPPING.maxExtraActions]: 4,
					[EFFECT_KEY_MAPPING.chance]: 5,
					[EFFECT_KEY_MAPPING.turnDuration]: arbitraryTurnDuration,
				});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
					value: { maxExtraActions: 4, chance: 5 },
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are 0 or missing', () => {
				it('defaults to 0 for missing count parameter', () => {
					const params = `,1,${arbitraryTurnDuration}`;
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
						value: { chance: 1, maxExtraActions: 0 },
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for missing count parameter when params property does not exist', () => {
					const effect = createArbitraryBaseEffect({
						[EFFECT_KEY_MAPPING.chance]: 4,
						[EFFECT_KEY_MAPPING.turnDuration]: arbitraryTurnDuration,
					});
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
						value: { chance: 4, maxExtraActions: 0 },
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a no params buff if chance is 0 and turn duration is 0', () => {
					const params = '1,0,0';
					const effect = createArbitraryBaseEffect({ params });

					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('returns a no params buff if chance is 0 and turn duration is 0 and params property does not exist', () => {
					const effect = createArbitraryBaseEffect({
						[EFFECT_KEY_MAPPING.chance]: 0,
						[EFFECT_KEY_MAPPING.maxExtraActions]: 5,
						[EFFECT_KEY_MAPPING.turnDuration]: 0,
					});
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				testTurnDurationScenarios({
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,${duration}`,
					buffIdsInTurnDurationBuff: [expectedBuffId],
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `1,2,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						duration: arbitraryTurnDuration,
						value: { maxExtraActions: 1, chance: 2 },
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

		describe('proc 78', () => {
			const STAT_PARAMS_ORDER = ['atk', 'def', 'rec', 'crit'];
			const EFFECT_TURN_DURATION_KEY = 'self stat buff turns';
			const expectedOriginalId = '78';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `proc:78:self stat boost-${stat}`));

			it('uses the params property when it exists', () => {
				const params = `1,2,3,4,${arbitraryTurnDuration}`;
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `proc:78:self stat boost-${stat}`,
						duration: arbitraryTurnDuration,
						value: +splitParams[index],
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,3,4,${arbitraryTurnDuration},6,7,8`;
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `proc:78:self stat boost-${stat}`,
						duration: arbitraryTurnDuration,
						value: +splitParams[index],
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
					'self atk% buff': 6,
					'self def% buff': 7,
					'self rec% buff': 8,
					'self crit% buff': 9,
					[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const expectedParamValues = [6, 7, 8, 9];
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `proc:78:self stat boost-${stat}`,
						duration: arbitraryTurnDuration,
						value: expectedParamValues[index],
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			STAT_PARAMS_ORDER.forEach((statCase) => {
				it(`returns only value for ${statCase} if it is non-zero and other stats are zero and only one element is specified`, () => {
					const params = [...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0'), arbitraryTurnDuration].join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: `proc:78:self stat boost-${statCase}`,
						duration: arbitraryTurnDuration,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`parses ${statCase} buff in effect when params property does not exist`, () => {
					const effect = createArbitraryBaseEffect({
						[`self ${statCase}% buff`]: 456,
						[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
					});
					const expectedResult = [baseBuffFactory({
						id: `proc:78:self stat boost-${statCase}`,
						duration: arbitraryTurnDuration,
						value: 456,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			describe('when all stats are 0', () => {
				testTurnDurationScenarios({
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,${duration}`,
					buffIdsInTurnDurationBuff: STAT_PARAMS_ORDER.map((stat) => `proc:78:self stat boost-${stat}`),
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `0,0,0,1,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:78:self stat boost-crit',
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 5] });
			});
		});

		describe('proc 79', () => {
			const expectedBuffId = 'proc:79:player exp boost';
			const expectedOriginalId = '79';
			const EXP_BOOST_BUFF_KEY = 'expBoost%';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = '1,2';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						[EXP_BOOST_BUFF_KEY]: 1,
						durationInMinutes: 2,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: {
							[EXP_BOOST_BUFF_KEY]: 1,
							durationInMinutes: 2,
						},
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

			it('falls back to unknown proc params property when params property does not exist', () => {
				const params = '3,4';
				const effect = createArbitraryBaseEffect({ 'unknown proc param': params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						[EXP_BOOST_BUFF_KEY]: 3,
						durationInMinutes: 4,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are missing', () => {
				it('defaults to 0 for missing duration value', () => {
					const params = '123';
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							[EXP_BOOST_BUFF_KEY]: 123,
							durationInMinutes: 0,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a no params buff when no parameters are given', () => {
					const effect = createArbitraryBaseEffect();
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: '1,2,123',
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: { [EXP_BOOST_BUFF_KEY]: 1, durationInMinutes: 2 },
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

		describe('proc 82', () => {
			const expectedBuffId = 'proc:82:resummon';
			const expectedOriginalId = '82';

			const HP_BUFF_KEY = 'startingHp%';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = '1,2';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						summonGroup: '1',
						[HP_BUFF_KEY]: 2,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: {
							summonGroup: '1',
							[HP_BUFF_KEY]: 2,
						},
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

			it('falls back to unknown proc params property when params property does not exist', () => {
				const params = '3,4';
				const effect = createArbitraryBaseEffect({ 'unknown proc param': params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						summonGroup: '3',
						[HP_BUFF_KEY]: 4,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are missing', () => {
				it('defaults to 0 for missing startingHp% value', () => {
					const params = '123';
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							summonGroup: '123',
							[HP_BUFF_KEY]: 0,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a no params buff when no parameters are given', () => {
					const effect = createArbitraryBaseEffect();
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: '1,2,123',
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: { summonGroup: '1', [HP_BUFF_KEY]: 2 },
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

		describe('proc 83', () => {
			const expectedBuffId = 'proc:83:spark critical';
			const expectedOriginalId = '83';

			const SPARK_DAMAGE_BUFF_KEY = 'sparkDamage%';
			const EFFECT_KEY_MAPPING = {
				chance: 'spark dmg inc chance%',
				'sparkDamage%': 'spark dmg inc% buff',
				turnDuration: 'spark dmg inc buff turns (131)',
			};

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = `1,2,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
					value: { chance: 1, [SPARK_DAMAGE_BUFF_KEY]: 2 },
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});


			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,${arbitraryTurnDuration},4,5,6`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
						value: { chance: 1, [SPARK_DAMAGE_BUFF_KEY]: 2 },
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
					[EFFECT_KEY_MAPPING.chance]: 4,
					[EFFECT_KEY_MAPPING['sparkDamage%']]: 5,
					[EFFECT_KEY_MAPPING.turnDuration]: arbitraryTurnDuration,
				});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
					value: { chance: 4, [SPARK_DAMAGE_BUFF_KEY]: 5 },
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are 0 or missing', () => {
				it('defaults to 0 for missing spark damage parameter', () => {
					const params = `1,,${arbitraryTurnDuration}`;
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
						value: { chance: 1, [SPARK_DAMAGE_BUFF_KEY]: 0 },
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for missing spark damage parameter when params property does not exist', () => {
					const effect = createArbitraryBaseEffect({
						[EFFECT_KEY_MAPPING.chance]: 4,
						[EFFECT_KEY_MAPPING.turnDuration]: arbitraryTurnDuration,
					});
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
						value: { chance: 4, [SPARK_DAMAGE_BUFF_KEY]: 0 },
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for missing chance parameter', () => {
					const params = `,1,${arbitraryTurnDuration}`;
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
						value: { chance: 0, [SPARK_DAMAGE_BUFF_KEY]: 1 },
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for missing chance parameter when params property does not exist', () => {
					const effect = createArbitraryBaseEffect({
						[EFFECT_KEY_MAPPING['sparkDamage%']]: 4,
						[EFFECT_KEY_MAPPING.turnDuration]: arbitraryTurnDuration,
					});
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
						value: { chance: 0, [SPARK_DAMAGE_BUFF_KEY]: 4 },
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				testTurnDurationScenarios({
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,${duration}`,
					buffIdsInTurnDurationBuff: [expectedBuffId],
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `1,2,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						duration: arbitraryTurnDuration,
						value: { chance: 1, [SPARK_DAMAGE_BUFF_KEY]: 2 },
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

		describe('proc 84', () => {
			testProcWithSingleNumericalParameterAndTurnDuration({
				expectedOriginalId: '84',
				expectedBuffId: 'proc:84:od fill rate',
				effectValueKey: 'od fill rate% buff',
				effectTurnDurationKey: 'od fill rate buff turns (132)',
			});
		});

		describe('proc 85', () => {
			testProcWithProcWithNumericalValueRangeAndChanceAndTurnDuration({
				expectedOriginalId: '85',
				expectedBuffId: 'proc:85:heal on hit',
				effectKeyLow: 'hp recover from dmg% low',
				effectKeyHigh: 'hp recover from dmg% high',
				effectKeyChance: 'hp recover from dmg chance',
				effectTurnDurationKey: 'hp recover from dmg buff turns (133)',
				buffKeyLow: 'healLow',
				buffKeyHigh: 'healHigh',
				generateConditions: () => ({ whenAttacked: true }),
			});
		});

		describe('proc 86', () => {
			testProcWithProcWithNumericalValueRangeAndChanceAndTurnDuration({
				expectedOriginalId: '86',
				expectedBuffId: 'proc:86:hp absorb',
				effectKeyLow: 'hp drain% low',
				effectKeyHigh: 'hp drain% high',
				effectKeyChance: 'hp drain chance%',
				effectTurnDurationKey: 'hp drain buff turns (134)',
				buffKeyLow: 'drainHealLow%',
				buffKeyHigh: 'drainHealHigh%',
			});
		});

		describe('proc 87', () => {
			testProcWithProcWithNumericalValueRangeAndChanceAndTurnDuration({
				expectedOriginalId: '87',
				expectedBuffId: 'proc:87:heal on spark',
				effectKeyLow: 'spark recover hp low',
				effectKeyHigh: 'spark recover hp high',
				effectKeyChance: 'spark recover hp chance%',
				effectTurnDurationKey: 'spark recover hp buff turns (135)',
				buffKeyLow: 'healLow',
				buffKeyHigh: 'healHigh',
			});
		});

		describe('proc 88', () => {
			const effectValueKey = 'spark dmg inc%';
			const effectTurnDurationKey = 'spark dmg inc% turns (136)';
			const expectedBuffId = 'proc:88:self spark damage';
			const expectedOriginalId = '88';

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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['0', '2', '3', '4', '5', '6', '0', '123']), 0] });
			});
		});

		describe('proc 89', () => {
			const STAT_PARAMS_ORDER = ['atk', 'def', 'rec'];
			const paramToResultStatMapping = {
				1: 'atk',
				2: 'def',
				3: 'rec',
				4: 'hp',
			};
			const expectedOriginalId = '89';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `proc:89:self converted-${stat}`));

			it('uses the params property when it exists', () => {
				const params = `1,2,3,4,${arbitraryTurnDuration}`;
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `proc:89:self converted-${stat}`,
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
						id: `proc:89:self converted-${stat}`,
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

			STAT_PARAMS_ORDER.forEach((statCase) => {
				Object.entries(paramToResultStatMapping).forEach(([convertedStatKey, convertedStatValue]) => {
					it(`returns only value for ${statCase} converted from ${convertedStatValue} if it is non-zero and other stats are zero and converted stat is ${convertedStatValue}`, () => {
						const params = [convertedStatKey, ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0'), arbitraryTurnDuration].join(',');
						const effect = createArbitraryBaseEffect({ params });
						const expectedResult = [baseBuffFactory({
							id: `proc:89:self converted-${statCase}`,
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

				it(`converts converted stat values with no mapping to "unknown" and the only non-zero stat is ${statCase}`, () => {
					const params = ['123', ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0'), arbitraryTurnDuration].join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: `proc:89:self converted-${statCase}`,
						duration: arbitraryTurnDuration,
						value: {
							convertedStat: 'unknown',
							value: 123,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

			});

			it('returns a no params buff if the effect params are non-number or missing', () => {
				const effect = createArbitraryBaseEffect({ params: 'non-number' });
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('returns a no params buff if no params are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: createArbitraryBaseEffect(), context: createArbitraryContext() });
			});

			describe('when all stats are 0', () => {
				testTurnDurationScenarios({
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,${duration}`,
					buffIdsInTurnDurationBuff: STAT_PARAMS_ORDER.map((stat) => `proc:89:self converted-${stat}`),
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `4,0,0,1,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:89:self converted-rec',
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

		describe('proc 92', () => {
			const expectedFlatFillId = 'proc:92:self max hp boost-flat';
			const expectedPercentFillId = 'proc:92:self max hp boost-percent';
			const expectedOriginalId = '92';

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

			describe('when values are missing', () => {
				it('defaults to 0 for missing flat fill value', () => {
					const params = ',123';
					const effect = createArbitraryBaseEffect({ params });
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
					const params = '123';
					const effect = createArbitraryBaseEffect({ params });
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
					const params = 'not a number,not a number';
					const effect = createArbitraryBaseEffect({ params });
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

		describe('proc 93', () => {
			const BUFF_ID_MAPPING = {
				criticalDamageBase: 'proc:93:critical damage resistance-base',
				criticalDamageBuff: 'proc:93:critical damage resistance-buff',
				elementDamageBase: 'proc:93:element damage resistance-base',
				elementDamageBuff: 'proc:93:element damage resistance-buff',
				sparkDamageBase: 'proc:93:spark damage resistance-base',
				sparkDamageBuff: 'proc:93:spark damage resistance-buff',
			};
			const EFFECT_KEY_MAPPING = {
				criticalDamageBase: 'crit dmg base damage resist% (143)',
				criticalDamageBuff: 'crit dmg buffed damage resist% (143)',
				elementDamageBase: 'strong base element damage resist% (144)',
				elementDamageBuff: 'strong buffed element damage resist% (144)',
				sparkDamageBase: 'spark dmg base resist% (145)',
				sparkDamageBuff: 'spark dmg buffed resist% (145)',
				turnDuration: 'dmg resist turns',
			};
			const PARAMS_ORDER = ['criticalDamageBase', 'criticalDamageBuff', 'elementDamageBase', 'elementDamageBuff', 'sparkDamageBase', 'sparkDamageBuff'];
			const expectedOriginalId = '93';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(PARAMS_ORDER.map((k) => BUFF_ID_MAPPING[k]));

			it('uses the params property when it exists', () => {
				const params = `1,2,3,4,5,6,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalDamageBase,
						duration: arbitraryTurnDuration,
						value: 1,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalDamageBuff,
						duration: arbitraryTurnDuration,
						value: 2,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.elementDamageBase,
						duration: arbitraryTurnDuration,
						value: 3,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.elementDamageBuff,
						duration: arbitraryTurnDuration,
						value: 4,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.sparkDamageBase,
						duration: arbitraryTurnDuration,
						value: 5,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.sparkDamageBuff,
						duration: arbitraryTurnDuration,
						value: 6,
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,3,4,5,6,${arbitraryTurnDuration},8,9,10`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalDamageBase,
						duration: arbitraryTurnDuration,
						value: 1,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalDamageBuff,
						duration: arbitraryTurnDuration,
						value: 2,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.elementDamageBase,
						duration: arbitraryTurnDuration,
						value: 3,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.elementDamageBuff,
						duration: arbitraryTurnDuration,
						value: 4,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.sparkDamageBase,
						duration: arbitraryTurnDuration,
						value: 5,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.sparkDamageBuff,
						duration: arbitraryTurnDuration,
						value: 6,
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						value: {
							param_7: '8',
							param_8: '9',
							param_9: '10',
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[EFFECT_KEY_MAPPING.criticalDamageBase]: 7,
					[EFFECT_KEY_MAPPING.criticalDamageBuff]: 8,
					[EFFECT_KEY_MAPPING.elementDamageBase]: 9,
					[EFFECT_KEY_MAPPING.elementDamageBuff]: 10,
					[EFFECT_KEY_MAPPING.sparkDamageBase]: 11,
					[EFFECT_KEY_MAPPING.sparkDamageBuff]: 12,
					[EFFECT_KEY_MAPPING.turnDuration]: arbitraryTurnDuration,
				});

				const expectedResult = [
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalDamageBase,
						duration: arbitraryTurnDuration,
						value: 7,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalDamageBuff,
						duration: arbitraryTurnDuration,
						value: 8,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.elementDamageBase,
						duration: arbitraryTurnDuration,
						value: 9,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.elementDamageBuff,
						duration: arbitraryTurnDuration,
						value: 10,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.sparkDamageBase,
						duration: arbitraryTurnDuration,
						value: 11,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.sparkDamageBuff,
						duration: arbitraryTurnDuration,
						value: 12,
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('parses effect properties to number when the params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[EFFECT_KEY_MAPPING.criticalDamageBase]: '7',
					[EFFECT_KEY_MAPPING.criticalDamageBuff]: '8',
					[EFFECT_KEY_MAPPING.elementDamageBase]: '9',
					[EFFECT_KEY_MAPPING.elementDamageBuff]: '10',
					[EFFECT_KEY_MAPPING.sparkDamageBase]: '11',
					[EFFECT_KEY_MAPPING.sparkDamageBuff]: '12',
					[EFFECT_KEY_MAPPING.turnDuration]: arbitraryTurnDuration,
				});

				const expectedResult = [
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalDamageBase,
						duration: arbitraryTurnDuration,
						value: 7,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalDamageBuff,
						duration: arbitraryTurnDuration,
						value: 8,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.elementDamageBase,
						duration: arbitraryTurnDuration,
						value: 9,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.elementDamageBuff,
						duration: arbitraryTurnDuration,
						value: 10,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.sparkDamageBase,
						duration: arbitraryTurnDuration,
						value: 11,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.sparkDamageBuff,
						duration: arbitraryTurnDuration,
						value: 12,
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('for missing or 0 values', () => {
				PARAMS_ORDER.forEach((key, index) => {
					it(`returns a single buff for ${BUFF_ID_MAPPING[key]} if it's the only drop resistance parameter that is non-zero`, () => {
						const params = Array.from({ length: PARAMS_ORDER.length }).fill(0).map((_, i) => i !== index ? '0' : '123').concat([arbitraryTurnDuration]).join(',');
						const effect = createArbitraryBaseEffect({ params });
						const expectedResult = [baseBuffFactory({
							id: BUFF_ID_MAPPING[key],
							duration: arbitraryTurnDuration,
							value: 123,
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});

					if (key in EFFECT_KEY_MAPPING) {
						it(`returns a single buff for ${BUFF_ID_MAPPING[key]} if it's the only drop resistance parameter that is non-zero and the params property does not exist`, () => {
							const effect = createArbitraryBaseEffect({
								[EFFECT_KEY_MAPPING[key]]: 456,
								[EFFECT_KEY_MAPPING.turnDuration]: arbitraryTurnDuration,
							});
							const expectedResult = [baseBuffFactory({
								id: BUFF_ID_MAPPING[key],
								duration: arbitraryTurnDuration,
								value: 456,
							})];

							const result = mappingFunction(effect, createArbitraryContext());
							expect(result).toEqual(expectedResult);
						});
					}
				});

				describe('when drop resistance parameters are 0', () => {
					testTurnDurationScenarios({
						createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,0,${duration}`,
						buffIdsInTurnDurationBuff: PARAMS_ORDER.map((k) => BUFF_ID_MAPPING[k]),
					});
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `1,0,0,0,0,0,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalDamageBase,
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

		describe('proc 94', () => {
			const expectedBuffId = 'proc:94:aoe normal attack';
			const expectedOriginalId = '94';

			const DAMAGE_BUFF_KEY = 'damageModifier%';
			const EFFECT_KEY_MAPPING = {
				'damageModifier%': 'aoe atk inc%',
				chance: 'chance to aoe',
				turnDuration: 'aoe atk turns (142)',
			};

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = `1,2,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
					value: { [DAMAGE_BUFF_KEY]: 1, chance: 2 },
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});


			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,${arbitraryTurnDuration},4,5,6`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
						value: { [DAMAGE_BUFF_KEY]: 1, chance: 2 },
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
					[EFFECT_KEY_MAPPING.chance]: 4,
					[EFFECT_KEY_MAPPING[DAMAGE_BUFF_KEY]]: 5,
					[EFFECT_KEY_MAPPING.turnDuration]: arbitraryTurnDuration,
				});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: arbitraryTurnDuration,
					value: { chance: 4, [DAMAGE_BUFF_KEY]: 5 },
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are 0 or missing', () => {
				it('defaults to 0 for missing damage parameter', () => {
					const params = `,1,${arbitraryTurnDuration}`;
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
						value: { chance: 1, [DAMAGE_BUFF_KEY]: 0 },
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for missing damage parameter when params property does not exist', () => {
					const effect = createArbitraryBaseEffect({
						[EFFECT_KEY_MAPPING.chance]: 4,
						[EFFECT_KEY_MAPPING.turnDuration]: arbitraryTurnDuration,
					});
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
						value: { chance: 4, [DAMAGE_BUFF_KEY]: 0 },
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a no params buff if chance is 0 and turn duration is 0', () => {
					const params = '1,0,0';
					const effect = createArbitraryBaseEffect({ params });

					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('returns a no params buff if chance is 0 and turn duration is 0 and params property does not exist', () => {
					const effect = createArbitraryBaseEffect({
						[EFFECT_KEY_MAPPING.chance]: 0,
						[EFFECT_KEY_MAPPING[DAMAGE_BUFF_KEY]]: 5,
						[EFFECT_KEY_MAPPING.turnDuration]: 0,
					});
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				testTurnDurationScenarios({
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,${duration}`,
					buffIdsInTurnDurationBuff: [expectedBuffId],
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `1,2,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						duration: arbitraryTurnDuration,
						value: { [DAMAGE_BUFF_KEY]: 1, chance: 2 },
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

		describe('proc 95', () => {
			testProcWithSingleNumericalParameterAndTurnDuration({
				expectedOriginalId: '95',
				expectedBuffId: 'proc:95:sphere lock',
			});
		});

		describe('proc 96', () => {
			testProcWithSingleNumericalParameterAndTurnDuration({
				expectedOriginalId: '96',
				expectedBuffId: 'proc:96:es lock',
			});
		});

		describe('proc 97', () => {
			const PARAMS_ORDER = ['atk%', 'flatAtk', 'crit%', 'bc%', 'hc%', 'dmg%'];
			const ELEMENT_EFFECT_KEY = 'additional element used for attack check';
			const SELF_ONLY_ELEMENT_EFFECT_VALUE = 'self only';
			const expectedBuffId = 'proc:97:element specific attack';
			const expectedOriginalId = '97';

			const weakerElementMapping = {
				fire: 'earth',
				water: 'fire',
				earth: 'thunder',
				thunder: 'water',
				light: 'dark',
				dark: 'light',
			};

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = '0,1,2,3,4,5,6';
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ params });
				const context = createArbitraryContext({
					damageFrames: {
						hits: arbitraryHitCount,
						[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: arbitraryDamageDistribution,
					},
					sourceElement: 'fire',
				});
				const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
					acc[param] = +splitParams[index + 1];
					return acc;
				}, {});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						...expectedValuesForParams,
						hits: arbitraryHitCount,
						distribution: arbitraryDamageDistribution,
					},
					conditions: {
						targetElements: ['earth'],
					},
				})];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '0,1,2,3,4,5,6,7,8,9';
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ params });
				const context = createArbitraryContext({
					damageFrames: {
						hits: arbitraryHitCount,
						[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: arbitraryDamageDistribution,
					},
					sourceElement: 'fire',
				});
				const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
					acc[param] = +splitParams[index + 1];
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
						conditions: {
							targetElements: ['earth'],
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						value: {
							param_7: '7',
							param_8: '8',
							param_9: '9',
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
				valuesInEffect[ELEMENT_EFFECT_KEY] = SELF_ONLY_ELEMENT_EFFECT_VALUE;
				const effect = createArbitraryBaseEffect(valuesInEffect);
				const context = createArbitraryContext({
					damageFrames: {
						hits: arbitraryHitCount,
						[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: arbitraryDamageDistribution,
					},
					sourceElement: 'fire',
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
					conditions: {
						targetElements: ['earth'],
					},
				})];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			testMissingDamageFramesScenarios({
				expectedBuffId,
				updateExpectedBuffForOnlyHitsOrDistributionCase: (buff) => {
					buff.conditions = { targetElements: ['unknown', 'unknown'] };
				},
			});

			PARAMS_ORDER.forEach((paramCase) => {
				it(`returns only value for ${paramCase} if it is non-zero and other stats are zero`, () => {
					const params = ['0'].concat((PARAMS_ORDER.map((param) => param === paramCase ? '789' : '0'))).join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							[paramCase]: 789,
							hits: 0,
							distribution: 0,
						},
						conditions: {
							targetElements: ['earth'],
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext({ sourceElement: 'fire' }));
					expect(result).toEqual(expectedResult);
				});
			});

			Object.entries(ELEMENT_MAPPING)
				.filter(([elementKey]) => elementKey !== '0')
				.forEach(([elementKey, elementValue]) => {
					it(`parses source element as [${elementValue}] and returns corresponding weaker element [${weakerElementMapping[elementValue]}]`, () => {
						const params = ['0'].concat((PARAMS_ORDER.map((_, index) => index + 1))).join(',');
						const effect = createArbitraryBaseEffect({ params });
						const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
							acc[param] = index + 1;
							return acc;
						}, {});
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							value: {
								...expectedValuesForParams,
								hits: 0,
								distribution: 0,
							},
							conditions: {
								targetElements: [weakerElementMapping[elementValue]],
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext({ sourceElement: elementValue }));
						expect(result).toEqual(expectedResult);
					});

					it(`parses element parameter [${elementKey}] as [${elementValue}] and returns corresponding weaker element [${weakerElementMapping[elementValue]}]`, () => {
						const params = [elementKey].concat((PARAMS_ORDER.map((_, index) => index + 1))).join(',');
						const effect = createArbitraryBaseEffect({ params });
						const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
							acc[param] = index + 1;
							return acc;
						}, {});
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							value: {
								...expectedValuesForParams,
								hits: 0,
								distribution: 0,
							},
							conditions: {
								targetElements: ['earth', weakerElementMapping[elementValue]],
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext({ sourceElement: 'fire' }));
						expect(result).toEqual(expectedResult);
					});

					it(`parses element parameter [${elementValue}] and returns corresponding weaker element [${weakerElementMapping[elementValue]}] when params property does not exist`, () => {
						const valuesInEffect = PARAMS_ORDER.reduce((acc, stat, index) => {
							let key;
							if (stat === 'flatAtk') {
								key = 'bb flat atk';
							} else if (stat === 'hits') {
								key = stat;
							} else {
								key = `bb ${stat}`;
							}
							acc[key] = index + 1;
							return acc;
						}, {});
						valuesInEffect[ELEMENT_EFFECT_KEY] = elementValue;
						const effect = createArbitraryBaseEffect(valuesInEffect);
						const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
							acc[param] = index + 1;
							return acc;
						}, {});
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							value: {
								...expectedValuesForParams,
								hits: 0,
								distribution: 0,
							},
							conditions: {
								targetElements: ['earth', weakerElementMapping[elementValue]],
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext({ sourceElement: 'fire' }));
						expect(result).toEqual(expectedResult);
					});
				});

			it('parses source element with no mapping as "unknown"', () => {
				const params = ['0'].concat((PARAMS_ORDER.map((_, index) => index + 1))).join(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
					acc[param] = index + 1;
					return acc;
				}, {});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						...expectedValuesForParams,
						hits: 0,
						distribution: 0,
					},
					conditions: {
						targetElements: ['unknown'],
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext({ sourceElement: 'a fake element' }));
				expect(result).toEqual(expectedResult);
			});

			it('parses lack of source element as "unknown"', () => {
				const params = ['0'].concat((PARAMS_ORDER.map((_, index) => index + 1))).join(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
					acc[param] = index + 1;
					return acc;
				}, {});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						...expectedValuesForParams,
						hits: 0,
						distribution: 0,
					},
					conditions: {
						targetElements: ['unknown'],
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('parses element parameters with no mapping as "unknown"', () => {
				const params = [123].concat((PARAMS_ORDER.map((_, index) => index + 1))).join(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
					acc[param] = index + 1;
					return acc;
				}, {});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						...expectedValuesForParams,
						hits: 0,
						distribution: 0,
					},
					conditions: {
						targetElements: ['earth', 'unknown'],
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext({ sourceElement: 'fire' }));
				expect(result).toEqual(expectedResult);
			});

			it('parses lack of element property as "unknown" when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({ 'bb flat atk': 123 });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						flatAtk: 123,
						hits: 0,
						distribution: 0,
					},
					conditions: {
						targetElements: ['earth', 'unknown'],
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext({ sourceElement: 'fire' }));
				expect(result).toEqual(expectedResult);
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({ params: '0,0,1,0,0,0,0,123' });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: { flatAtk: 1, hits: 0, distribution: 0 },
						conditions: {
							targetElements: ['dark'],
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

				const context = createArbitraryContext({ sourceElement: 'light' });
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 7] });
			});
		});

		describe('proc 113', () => {
			const effectValueKey = 'od fill';
			const effectTurnDurationKey = 'od fill turns (148)';
			const expectedBuffId = 'proc:113:gradual od fill';
			const expectedOriginalId = '113';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = `0,0,1,${arbitraryTurnDuration}`;
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
				const params = `1,2,3,${arbitraryTurnDuration},5,6,7`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
						value: 3,
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						value: {
							param_0: '1',
							param_1: '2',
							param_4: '5',
							param_5: '6',
							param_6: '7',
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra intermediate parameters', () => {
				const params = `1,2,3,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: arbitraryTurnDuration,
						value: 3,
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						value: {
							param_0: '1',
							param_1: '2',
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
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,${duration}`,
					buffIdsInTurnDurationBuff: [expectedBuffId],
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `456,789,1,${arbitraryTurnDuration},123`,
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['456','789', '0', '0', '123']), 0] });
			});
		});

		describe('proc 119', () => {
			const expectedFlatDrainId = 'proc:119:gradual bc drain-flat';
			const expectedPercentDrainId = 'proc:119:gradual bc drain-percent';
			const expectedOriginalId = '119';
			const DRAIN_PERCENT_KEY = 'drain%';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedFlatDrainId, expectedPercentDrainId]);

			it('uses the params property when it exists', () => {
				const params = `100,2,3,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatDrainId,
						duration: arbitraryTurnDuration,
						value: {
							drain: 1,
							chance: 3,
						},
					}),
					baseBuffFactory({
						id: expectedPercentDrainId,
						duration: arbitraryTurnDuration,
						value: {
							[DRAIN_PERCENT_KEY]: 2,
							chance: 3,
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `100,2,3,${arbitraryTurnDuration},5,6,7`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatDrainId,
						duration: arbitraryTurnDuration,
						value: {
							drain: 1,
							chance: 3,
						},
					}),
					baseBuffFactory({
						id: expectedPercentDrainId,
						duration: arbitraryTurnDuration,
						value: {
							[DRAIN_PERCENT_KEY]: 2,
							chance: 3,
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

			describe('when values are missing', () => {
				it('does not return a flat drain buff if it is 0', () => {
					const params = `0,123,3,${arbitraryTurnDuration}`;
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: expectedPercentDrainId,
						duration: arbitraryTurnDuration,
						value: {
							[DRAIN_PERCENT_KEY]: 123,
							chance: 3,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('does not return a percent drain buff if it is 0', () => {
					const params = `12300,0,3,${arbitraryTurnDuration}`;
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: expectedFlatDrainId,
						duration: arbitraryTurnDuration,
						value: {
							drain: 123,
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

				it('defaults to 0 for missing chance and turn duration', () => {
					const params = '12300,456';
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [
						baseBuffFactory({
							id: expectedFlatDrainId,
							duration: 0,
							value: {
								drain: 123,
								chance: 0,
							},
						}),
						baseBuffFactory({
							id: expectedPercentDrainId,
							duration: 0,
							value: {
								[DRAIN_PERCENT_KEY]: 456,
								chance: 0,
							},
						}),
					];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				testTurnDurationScenarios({
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,${duration}`,
					buffIdsInTurnDurationBuff: [expectedFlatDrainId, expectedPercentDrainId],
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `100,2,3,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatDrainId,
						sources: arbitrarySourceValue,
						duration: arbitraryTurnDuration,
						value: {
							drain: 1,
							chance: 3,
						},
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: expectedPercentDrainId,
						sources: arbitrarySourceValue,
						duration: arbitraryTurnDuration,
						value: {
							[DRAIN_PERCENT_KEY]: 2,
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 4] });
			});
		});

		describe('proc 123', () => {
			const expectedBuffId = 'proc:123:od gauge drain';
			const expectedOriginalId = '123';
			const DRAIN_PERCENT_KEY = 'drain%';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = '1,0,3';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						chance: 1,
						[DRAIN_PERCENT_KEY]: 3,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,6';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: {
							chance: 1,
							[DRAIN_PERCENT_KEY]: 3,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						value: {
							param_1: '2',
							param_3: '4',
							param_4: '5',
							param_5: '6',
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra intermediate parameters', () => {
				const params = '1,2,3';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: {
							chance: 1,
							[DRAIN_PERCENT_KEY]: 3,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						value: {
							param_1: '2',
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are missing', () => {
				it('defaults to 0 for missing drain value', () => {
					const params = '123,0,';
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							chance: 123,
							[DRAIN_PERCENT_KEY]: 0,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for missing chance value', () => {
					const params = ',0,123';
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							chance: 0,
							[DRAIN_PERCENT_KEY]: 123,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a no params buff when no parameters are given', () => {
					const effect = createArbitraryBaseEffect();
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: '1,2,3,123',
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: {
							chance: 1,
							[DRAIN_PERCENT_KEY]: 3,
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['2', '0', '123']), 1] });
			});
		});

		describe('proc 126', () => {
			testProcWithSingleNumericalParameterAndTurnDuration({
				expectedOriginalId: '126',
				expectedBuffId: 'proc:126:damage over time reduction',
			});
		});

		describe('proc 127', () => {
			const expectedBuffId = 'proc:127:lock on';
			const expectedOriginalId = '127';

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
					duration: 1,
					value: true,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const effect = createArbitraryBaseEffect({ params: '1,2,3,4' });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: 1,
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

			it('returns a buff value when params value is 0', () => {
				const effect = createArbitraryBaseEffect({ params: '0' });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 0,
					value: true,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff value when params value is missing', () => {
				const effect = createArbitraryBaseEffect();
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 0,
					value: true,
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
						duration: 10,
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

		describe('proc 130', () => {
			const expectedOriginalId = '130';
			const AILMENTS_ORDER = ['atk', 'def', 'rec'];
			const EFFECT_KEY_VALUE_MAPPING = {
				atk: 'atk% buff (153)',
				def: 'def% buff (154)',
				rec: 'rec% buff (155)',
			};
			const EFFECT_KEY_CHANCE_MAPPING = {
				atk: 'atk buff chance%',
				def: 'def buff chance%',
				rec: 'rec buff chance%',
			};
			const DEBUFF_TURN_EFFECT_KEY = 'debuff turns';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(AILMENTS_ORDER.map((a) => `proc:130:inflict on hit-${a} down`));

			it('uses the params property when it exists', () => {
				const params = `1,2,3,4,5,6,7,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:130:inflict on hit-atk down',
						duration: arbitraryTurnDuration,
						value: {
							reductionValue: 1,
							chance: 4,
							debuffTurnDuration: 7,
						},
					}),
					baseBuffFactory({
						id: 'proc:130:inflict on hit-def down',
						duration: arbitraryTurnDuration,
						value: {
							reductionValue: 2,
							chance: 5,
							debuffTurnDuration: 7,
						},
					}),
					baseBuffFactory({
						id: 'proc:130:inflict on hit-rec down',
						duration: arbitraryTurnDuration,
						value: {
							reductionValue: 3,
							chance: 6,
							debuffTurnDuration: 7,
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,3,4,5,6,7,${arbitraryTurnDuration},9,10,11`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:130:inflict on hit-atk down',
						duration: arbitraryTurnDuration,
						value: {
							reductionValue: 1,
							chance: 4,
							debuffTurnDuration: 7,
						},
					}),
					baseBuffFactory({
						id: 'proc:130:inflict on hit-def down',
						duration: arbitraryTurnDuration,
						value: {
							reductionValue: 2,
							chance: 5,
							debuffTurnDuration: 7,
						},
					}),
					baseBuffFactory({
						id: 'proc:130:inflict on hit-rec down',
						duration: arbitraryTurnDuration,
						value: {
							reductionValue: 3,
							chance: 6,
							debuffTurnDuration: 7,
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
					[EFFECT_KEY_VALUE_MAPPING.atk]: 1,
					[EFFECT_KEY_CHANCE_MAPPING.atk]: 2,
					[EFFECT_KEY_VALUE_MAPPING.def]: 3,
					[EFFECT_KEY_CHANCE_MAPPING.def]: 4,
					[EFFECT_KEY_VALUE_MAPPING.rec]: 5,
					[EFFECT_KEY_CHANCE_MAPPING.rec]: 6,
					[DEBUFF_TURN_EFFECT_KEY]: 7,
					[DEFAULT_TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:130:inflict on hit-atk down',
						duration: arbitraryTurnDuration,
						value: {
							reductionValue: 1,
							chance: 2,
							debuffTurnDuration: 7,
						},
					}),
					baseBuffFactory({
						id: 'proc:130:inflict on hit-def down',
						duration: arbitraryTurnDuration,
						value: {
							reductionValue: 3,
							chance: 4,
							debuffTurnDuration: 7,
						},
					}),
					baseBuffFactory({
						id: 'proc:130:inflict on hit-rec down',
						duration: arbitraryTurnDuration,
						value: {
							reductionValue: 5,
							chance: 6,
							debuffTurnDuration: 7,
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are 0 or missing', () => {
				AILMENTS_ORDER.forEach((type) => {
					it(`returns an entry for ${type} when its reduction value is the only non-zero value of the individual reduction properties`, () => {
						const params = [
							type === 'atk' ? '123' : '0',
							type === 'def' ? '123' : '0',
							type === 'rec' ? '123' : '0',
							'0,0,0', // chance values of 0
							'0',
							arbitraryTurnDuration,
						].join(',');
						const effect = createArbitraryBaseEffect({ params });
						const expectedResult = [baseBuffFactory({
							id: `proc:130:inflict on hit-${type} down`,
							duration: arbitraryTurnDuration,
							value: {
								reductionValue: 123,
								chance: 0,
								debuffTurnDuration: 0,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});

					it(`returns an entry for ${type} when its reduction chance is the only non-zero value of the individual reduction properties`, () => {
						const params = [
							'0,0,0', // reduction values of 0
							type === 'atk' ? '123' : '0',
							type === 'def' ? '123' : '0',
							type === 'rec' ? '123' : '0',
							'0',
							arbitraryTurnDuration,
						].join(',');
						const effect = createArbitraryBaseEffect({ params });
						const expectedResult = [baseBuffFactory({
							id: `proc:130:inflict on hit-${type} down`,
							duration: arbitraryTurnDuration,
							value: {
								reductionValue: 0,
								chance: 123,
								debuffTurnDuration: 0,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});

					it(`returns an entry for ${type} when its reduction value is the only non-zero value of the individual reduction properties and the params property does not exist`, () => {
						const effect = createArbitraryBaseEffect({
							[EFFECT_KEY_VALUE_MAPPING[type]]: 456,
							[DEFAULT_TURN_DURATION_KEY]: arbitraryTurnDuration,
						});
						const expectedResult = [baseBuffFactory({
							id: `proc:130:inflict on hit-${type} down`,
							duration: arbitraryTurnDuration,
							value: {
								reductionValue: 456,
								chance: 0,
								debuffTurnDuration: 0,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});

					it(`returns an entry for ${type} when its reduction chance is the only non-zero value of the individual reduction properties and the params property does not exist`, () => {
						const effect = createArbitraryBaseEffect({
							[EFFECT_KEY_CHANCE_MAPPING[type]]: 456,
							[DEFAULT_TURN_DURATION_KEY]: arbitraryTurnDuration,
						});
						const expectedResult = [baseBuffFactory({
							id: `proc:130:inflict on hit-${type} down`,
							duration: arbitraryTurnDuration,
							value: {
								reductionValue: 0,
								chance: 456,
								debuffTurnDuration: 0,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				describe('for buff duration', () => {
					testTurnDurationScenarios({
						createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,0,0,${duration}`,
						buffIdsInTurnDurationBuff: AILMENTS_ORDER.map((a) => `proc:130:inflict on hit-${a} down`),
						modifyTurnDurationBuff: (buff) => {
							buff.value.debuffTurnDuration = 0;
						},
					});
				});

				describe('for debuff duration', () => {
					testTurnDurationScenarios({
						createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,0,${duration},0`,
						buffIdsInTurnDurationBuff: AILMENTS_ORDER.map((a) => `proc:130:inflict on hit-${a} down`),
						modifyTurnDurationBuff: (buff) => {
							buff.value.debuffTurnDuration = buff.value.duration;
							buff.value.duration = 0;
						},
					});
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `1,0,0,0,0,0,0,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:130:inflict on hit-atk down',
						sources: arbitrarySourceValue,
						duration: arbitraryTurnDuration,
						value: { reductionValue: 1, chance: 0, debuffTurnDuration: 0 },
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

		describe('proc 131', () => {
			testProcWithSingleNumericalParameterAndTurnDuration({
				expectedOriginalId: '131',
				expectedBuffId: 'proc:131:spark damage mitigation',
			});
		});

		describe('proc 132', () => {
			const expectedOriginalId = '132';
			const VULNERABILITY_ORDER = ['critical', 'elemental'];
			const EFFECT_KEY_VALUE_MAPPING = {
				critical: 'crit vuln dmg% (157)',
				elemental: 'elemental vuln dmg% (158)',
			};
			const EFFECT_KEY_CHANCE_MAPPING = {
				critical: 'crit vuln chance%',
				elemental: 'elemental vuln chance%',
			};
			const TURN_DURATION_KEY = 'vuln turns';
			const VALUE_KEY = 'increased dmg%';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(VULNERABILITY_ORDER.map((v) => `proc:132:chance inflict vulnerability-${v}`));

			it('uses the params property when it exists', () => {
				const params = `1,2,3,4,${arbitraryTurnDuration}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:132:chance inflict vulnerability-critical',
						duration: arbitraryTurnDuration,
						value: {
							[VALUE_KEY]: 1,
							chance: 3,
						},
					}),
					baseBuffFactory({
						id: 'proc:132:chance inflict vulnerability-elemental',
						duration: arbitraryTurnDuration,
						value: {
							[VALUE_KEY]: 2,
							chance: 4,
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,3,4,${arbitraryTurnDuration},6,7,8`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:132:chance inflict vulnerability-critical',
						duration: arbitraryTurnDuration,
						value: {
							[VALUE_KEY]: 1,
							chance: 3,
						},
					}),
					baseBuffFactory({
						id: 'proc:132:chance inflict vulnerability-elemental',
						duration: arbitraryTurnDuration,
						value: {
							[VALUE_KEY]: 2,
							chance: 4,
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
					[EFFECT_KEY_VALUE_MAPPING.critical]: 1,
					[EFFECT_KEY_CHANCE_MAPPING.critical]: 2,
					[EFFECT_KEY_VALUE_MAPPING.elemental]: 3,
					[EFFECT_KEY_CHANCE_MAPPING.elemental]: 4,
					[TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:132:chance inflict vulnerability-critical',
						duration: arbitraryTurnDuration,
						value: {
							[VALUE_KEY]: 1,
							chance: 2,
						},
					}),
					baseBuffFactory({
						id: 'proc:132:chance inflict vulnerability-elemental',
						duration: arbitraryTurnDuration,
						value: {
							[VALUE_KEY]: 3,
							chance: 4,
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are 0 or missing', () => {
				VULNERABILITY_ORDER.forEach((type) => {
					it(`returns an entry for ${type} when its reduction value is the only non-zero value of the individual reduction properties`, () => {
						const params = [
							type === 'critical' ? '123' : '0',
							type === 'elemental' ? '123' : '0',
							'0,0', // chance values of 0
							arbitraryTurnDuration,
						].join(',');
						const effect = createArbitraryBaseEffect({ params });
						const expectedResult = [baseBuffFactory({
							id: `proc:132:chance inflict vulnerability-${type}`,
							duration: arbitraryTurnDuration,
							value: {
								[VALUE_KEY]: 123,
								chance: 0,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});

					it(`returns an entry for ${type} when its reduction chance is the only non-zero value of the individual reduction properties`, () => {
						const params = [
							'0,0', // reduction values of 0
							type === 'critical' ? '123' : '0',
							type === 'elemental' ? '123' : '0',
							arbitraryTurnDuration,
						].join(',');
						const effect = createArbitraryBaseEffect({ params });
						const expectedResult = [baseBuffFactory({
							id: `proc:132:chance inflict vulnerability-${type}`,
							duration: arbitraryTurnDuration,
							value: {
								[VALUE_KEY]: 0,
								chance: 123,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});

					it(`returns an entry for ${type} when its reduction value is the only non-zero value of the individual reduction properties and the params property does not exist`, () => {
						const effect = createArbitraryBaseEffect({
							[EFFECT_KEY_VALUE_MAPPING[type]]: 456,
							[TURN_DURATION_KEY]: arbitraryTurnDuration,
						});
						const expectedResult = [baseBuffFactory({
							id: `proc:132:chance inflict vulnerability-${type}`,
							duration: arbitraryTurnDuration,
							value: {
								[VALUE_KEY]: 456,
								chance: 0,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});

					it(`returns an entry for ${type} when its reduction chance is the only non-zero value of the individual reduction properties and the params property does not exist`, () => {
						const effect = createArbitraryBaseEffect({
							[EFFECT_KEY_CHANCE_MAPPING[type]]: 456,
							[TURN_DURATION_KEY]: arbitraryTurnDuration,
						});
						const expectedResult = [baseBuffFactory({
							id: `proc:132:chance inflict vulnerability-${type}`,
							duration: arbitraryTurnDuration,
							value: {
								[VALUE_KEY]: 0,
								chance: 456,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				describe('for buff duration', () => {
					testTurnDurationScenarios({
						createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,${duration}`,
						buffIdsInTurnDurationBuff: VULNERABILITY_ORDER.map((v) => `proc:132:chance inflict vulnerability-${v}`),
					});
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `1,0,0,0,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:132:chance inflict vulnerability-critical',
						sources: arbitrarySourceValue,
						duration: arbitraryTurnDuration,
						value: { [VALUE_KEY]: 1, chance: 0 },
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

		describe('proc 901', () => {
			const expectedBuffId = 'proc:901:raid burst heal';
			const expectedOriginalId = '901';

			const VALUE_LOW_KEY = 'baseRecLow%';
			const VALUE_HIGH_KEY = 'baseRecHigh%';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = '1,2';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						[VALUE_LOW_KEY]: 1,
						[VALUE_HIGH_KEY]: 2,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: {
							[VALUE_LOW_KEY]: 1,
							[VALUE_HIGH_KEY]: 2,
						},
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

			describe('when values are missing', () => {
				const PARAMS_ORDER = [VALUE_LOW_KEY, VALUE_HIGH_KEY];
				PARAMS_ORDER.forEach((param) => {
					it(`defaults to 0 for missing ${param} value`, () => {
						const params = [
							param !== VALUE_LOW_KEY ? '123' : '0',
							param !== VALUE_HIGH_KEY ? '123' : '0',
						].join(',');
						const effect = createArbitraryBaseEffect({ params });
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							value: {
								[VALUE_LOW_KEY]: param !== VALUE_LOW_KEY ? 123 : 0,
								[VALUE_HIGH_KEY]: param !== VALUE_HIGH_KEY ? 123 : 0,
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

				it('defaults values for effect params to 0 if they are non-number or missing', () => {
					const effect = createArbitraryBaseEffect({ params: 'non-number' });
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: '0,1,123',
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: {
							[VALUE_LOW_KEY]: 0,
							[VALUE_HIGH_KEY]: 1,
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 2] });
			});
		});

		describe('proc 902', () => {
			const STAT_PARAMS_ORDER = ['atk', 'def', 'rec', 'crit'];
			const EFFECT_TURN_DURATION_KEY = 'buff timer (seconds)';
			const expectedOriginalId = '902';

			const EFFECT_KEY_MAPPING = {
				atk: 'atk% buff (100)',
				def: 'def% buff (101)',
				rec: 'rec% buff (102)',
				crit: 'crit% buff (103)',
			};

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `proc:902:raid stat boost-${stat}`));

			it('uses the params property when it exists', () => {
				const params = `1,2,3,4,${arbitraryTurnDuration}`;
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `proc:902:raid stat boost-${stat}`,
						duration: arbitraryTurnDuration,
						value: +splitParams[index],
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,3,4,${arbitraryTurnDuration},6,7,8`;
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `proc:902:raid stat boost-${stat}`,
						duration: arbitraryTurnDuration,
						value: +splitParams[index],
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
					[EFFECT_KEY_MAPPING.atk]: 6,
					[EFFECT_KEY_MAPPING.def]: 7,
					[EFFECT_KEY_MAPPING.rec]: 8,
					[EFFECT_KEY_MAPPING.crit]: 9,
					[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const expectedParamValues = [6, 7, 8, 9];
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `proc:902:raid stat boost-${stat}`,
						duration: arbitraryTurnDuration,
						value: expectedParamValues[index],
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			STAT_PARAMS_ORDER.forEach((statCase) => {
				it(`returns only value for ${statCase} if it is non-zero and other stats are zero and only one element is specified`, () => {
					const params = [...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0'), arbitraryTurnDuration].join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: `proc:902:raid stat boost-${statCase}`,
						duration: arbitraryTurnDuration,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`parses ${statCase} buff in effect when params property does not exist`, () => {
					const effect = createArbitraryBaseEffect({
						[EFFECT_KEY_MAPPING[statCase]]: 456,
						[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
					});
					const expectedResult = [baseBuffFactory({
						id: `proc:902:raid stat boost-${statCase}`,
						duration: arbitraryTurnDuration,
						value: 456,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('returns a no params buff if all stats are 0 and duration is non-zero', () => {
				const effect = createArbitraryBaseEffect({ params: '0,0,0,0,123' });
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('returns a no params buff when no parameters are given', () => {
				const effect = createArbitraryBaseEffect();
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `0,0,0,1,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:902:raid stat boost-crit',
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 5] });
			});
		});

		describe('proc 903', () => {
			const expectedBuffId = 'proc:903:boss location reveal';
			const expectedOriginalId = '903';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = '0,2';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 2,
					value: true,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: 2,
						value: true,
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						value: {
							param_0: '1',
							param_2: '3',
							param_3: '4',
							param_4: '5',
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for intermediate extra parameters', () => {
				const params = '1,2';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: 2,
						value: true,
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						value: {
							param_0: '1',
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are missing or 0', () => {
				it('returns a no params buff when no parameters are given', () => {
					const effect = createArbitraryBaseEffect();
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('returns a no params buff when duration is 0', () => {
					const params = '0';
					const effect = createArbitraryBaseEffect({ params });
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: '1,2,123',
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						duration: 2,
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['1', '0', '123']), 0] });
			});
		});

		describe('proc 905', () => {
			const expectedBuffId = 'proc:905:teleport to camp';
			const expectedOriginalId = '905';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = '0';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: true,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: true,
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						value: {
							param_0: '1',
							param_1: '2',
							param_2: '3',
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff when no parameters are given', () => {
				const effect = createArbitraryBaseEffect();
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: true,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: '123',
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 0] });
			});
		});

		describe('proc 906', () => {
			const expectedBuffId = 'proc:906:flee battle';
			const expectedOriginalId = '906';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = '0';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: true,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: true,
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						value: {
							param_0: '1',
							param_1: '2',
							param_2: '3',
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff when no parameters are given', () => {
				const effect = createArbitraryBaseEffect();
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: true,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: '123',
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 0] });
			});
		});

		describe('proc 907', () => {
			testProcWithSingleNumericalParameterAndTurnDuration({
				expectedOriginalId: '907',
				expectedBuffId: 'proc:907:raid mitigation',
			});
		});

		describe('proc 908', () => {
			const expectedBuffId = 'proc:908:raid drop rate multiplier';
			const expectedOriginalId = '908';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const effect = createArbitraryBaseEffect({ params: '50' });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: 1.5,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const effect = createArbitraryBaseEffect({ params: '100,2,3,4' });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: 2,
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

			it('returns a no params buff when no parameters are given', () => {
				const effect = createArbitraryBaseEffect();
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('returns a no params buff if parsed value from params is zero', () => {
				const effect = createArbitraryBaseEffect({ params: '0' });
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('returns a no params buff if the effect params are non-number or missing', () => {
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
						value: 1.01,
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

		describe('proc 10000', () => {
			const STAT_PARAMS_ORDER = ['atk', 'def', 'crit'];
			const EFFECT_TURN_DURATION_KEY = 'taunt turns (10000)';
			const expectedOriginalId = '10000';
			const expectedTauntBuffId = 'proc:10000:taunt';

			beforeEach(() => {
				mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `proc:10000:taunt-${stat}`));

			it('uses the params property when it exists', () => {
				const params = `1,2,3,${arbitraryTurnDuration}`;
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedTauntBuffId,
					duration: arbitraryTurnDuration,
					value: true,
				})].concat(STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `${expectedTauntBuffId}-${stat}`,
						duration: arbitraryTurnDuration,
						value: +splitParams[index],
					});
				}));

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,3,${arbitraryTurnDuration},5,6,7`;
				const splitParams = params.split(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedTauntBuffId,
					duration: arbitraryTurnDuration,
					value: true,
				})].concat(STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `${expectedTauntBuffId}-${stat}`,
						duration: arbitraryTurnDuration,
						value: +splitParams[index],
					});
				})).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
					value: {
						param_4: '5',
						param_5: '6',
						param_6: '7',
					},
				})]);

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					'atk% buff': 5,
					'def% buff': 6,
					'crit% buff': 7,
					[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
				});
				const expectedParamValues = [5, 6, 7];
				const expectedResult = [baseBuffFactory({
					id: expectedTauntBuffId,
					duration: arbitraryTurnDuration,
					value: true,
				})].concat(STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `${expectedTauntBuffId}-${stat}`,
						duration: arbitraryTurnDuration,
						value: expectedParamValues[index],
					});
				}));

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			STAT_PARAMS_ORDER.forEach((statCase) => {
				it(`returns stat value for ${statCase} if it is non-zero and other stats are zero and only one element is specified`, () => {
					const params = [...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0'), arbitraryTurnDuration].join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [
						baseBuffFactory({
							id: expectedTauntBuffId,
							duration: arbitraryTurnDuration,
							value: true,
						}),
						baseBuffFactory({
							id: `${expectedTauntBuffId}-${statCase}`,
							duration: arbitraryTurnDuration,
							value: 123,
						}),
					];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`parses ${statCase} buff in effect when params property does not exist`, () => {
					const effect = createArbitraryBaseEffect({
						[`${statCase}% buff`]: 456,
						[EFFECT_TURN_DURATION_KEY]: arbitraryTurnDuration,
					});
					const expectedResult = [
						baseBuffFactory({
							id: expectedTauntBuffId,
							duration: arbitraryTurnDuration,
							value: true,
						}),
						baseBuffFactory({
							id: `${expectedTauntBuffId}-${statCase}`,
							duration: arbitraryTurnDuration,
							value: 456,
						}),
					];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			describe('when all stats are 0', () => {
				const createParamsWithZeroValueAndTurnDuration = (duration) => `0,0,0,${duration}`;
				const expectedBuffIdsInTurnDurationBuff = [expectedTauntBuffId].concat(STAT_PARAMS_ORDER.map((stat) => `${expectedTauntBuffId}-${stat}`));

				it('returns a turn modification buff if turn duration is non-zero and source is not burst type', () => {
					const params = createParamsWithZeroValueAndTurnDuration(arbitraryTurnDuration);
					const effect = createArbitraryBaseEffect({ params });
					const context = createArbitraryContext();
					const expectedResult = [baseBuffFactory({
						id: BuffId.TURN_DURATION_MODIFICATION,
						value: {
							buffs: expectedBuffIdsInTurnDurationBuff,
							duration: arbitraryTurnDuration,
						},
					}, [EFFECT_DELAY_BUFF_PROP])];

					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});

				it('returns just a taunt buff if turn duration is non-zero and source is of burst type', () => {
					const params = createParamsWithZeroValueAndTurnDuration(arbitraryTurnDuration);
					const effect = createArbitraryBaseEffect({ params });
					const context = createArbitraryContext({ source: arbitraryBuffSourceOfBurstType, sourceId: `some source type for ${expectedTauntBuffId}` });
					const expectedResult = [baseBuffFactory({
						id: expectedTauntBuffId,
						duration: arbitraryTurnDuration,
						value: true,
					}, ['sources'])];
					expectedResult[0].sources = [`${arbitraryBuffSourceOfBurstType}-some source type for ${expectedTauntBuffId}`];
					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
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
					mappingFunction(effect, context, injectionContext);
					expectDefaultInjectionContext({ injectionContext, buffSourceIsBurstTypeArgs: [arbitraryBuffSourceOfBurstType] });
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = createArbitraryBaseEffect({
					params: `0,0,1,${arbitraryTurnDuration},123`,
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedTauntBuffId,
						sources: arbitrarySourceValue,
						duration: arbitraryTurnDuration,
						value: true,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: `${expectedTauntBuffId}-crit`,
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
	});
});
