const { getPassiveEffectToBuffMapping } = require('./passive-effect-mapping');
const { TargetType, TargetArea, UnitElement, UnitType, UnitGender } = require('../../datamine-types');
const { BuffId } = require('./buff-types');
const { getConditionalEffectToBuffMapping } = require('./conditional-effect-mapping');
const { getProcEffectToBuffMapping } = require('./proc-effect-mapping');

describe('getPassiveEffectToBuffMapping method', () => {
	it('uses the same mapping object on multiple calls', () => {
		const initialMapping = getPassiveEffectToBuffMapping();
		expect(initialMapping).toBeDefined();
		for (let i = 0; i < 5; ++i) {
			expect(getPassiveEffectToBuffMapping()).toBe(initialMapping);
		}
	});

	it('returns a new mapping object when the reload parameter is true', () => {
		const allMappings = new Set();
		const initialMapping = getPassiveEffectToBuffMapping();
		expect(initialMapping).toBeDefined();
		allMappings.add(initialMapping);
		for (let i = 0; i < 5; ++i) {
			const newMapping = getPassiveEffectToBuffMapping(true);
			expect(newMapping).toBeDefined();
			expect(allMappings.has(newMapping))
				.withContext('expect new mapping object to not be in set of previous mappings')
				.toBeFalse();
			allMappings.add(newMapping);
		}

		// should match number of times getPassiveEffectToBuffMapping was called in this test
		expect(allMappings.size)
			.withContext('expect number of mappings added to set to match number of times getPassiveEffectToBuffMapping was called')
			.toBe(6);
	});

	describe('for default mapping', () => {
		/**
			 * @type {import('./passive-effect-mapping').PassiveEffectToBuffFunction}
			 */
		let mappingFunction;
		/**
		 * @type {(params?: import('./buff-types').IBuff, propsToDelete?: string[]) => import('./buff-types').IBuff}
		 */
		let baseBuffFactory;
		const arbitraryConditionValue = { condition: 'value' };
		const arbitraryTargetData = { targetData: 'data' };
		const arbitrarySourceValue = ['some source value'];
		const arbitraryUnknownValue = { unknownValue: 'some unknown value' };

		const HP_ABOVE_EFFECT_KEY = 'hp above % buff requirement';
		const HP_BELOW_EFFECT_KEY = 'hp below % buff requirement';

		const BB_GAUGE_ABOVE_EFFECT_KEY = 'bb gauge above % buff requirement';
		const BB_GAUGE_BELOW_EFFECT_KEY = 'bb gauge below % buff requirement';

		const BUFF_TARGET_PROPS = ['targetType', 'targetArea'];
		const STAT_PARAMS_ORDER = ['atk', 'def', 'rec', 'crit', 'hp'];
		const AILMENTS_ORDER = ['poison', 'weak', 'sick', 'injury', 'curse', 'paralysis'];
		const DROP_TYPE_ORDER = ['bc', 'hc', 'item', 'zel', 'karma'];

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
			 * @type {import('./_helpers').IPassiveBuffProcessingInjectionContext}
			 */
			const injectionContext = {
				processExtraSkillConditions: jasmine.createSpy('processExtraSkillConditionsspy'),
				getPassiveTargetData: jasmine.createSpy('getPassiveTargetDataSpy'),
				createSourcesFromContext: jasmine.createSpy('createSourcesFromContextSpy'),
				createUnknownParamsValue: jasmine.createSpy('createUnkownParamsValueSpy'),
			};
			injectionContext.processExtraSkillConditions.and.returnValue(arbitraryConditionValue);
			injectionContext.getPassiveTargetData.and.returnValue(arbitraryTargetData);
			injectionContext.createSourcesFromContext.and.returnValue(arbitrarySourceValue);
			injectionContext.createUnknownParamsValue.and.returnValue(arbitraryUnknownValue);
			return injectionContext;
		};

		/**
		 * @param {import('./_helpers').IPassiveBuffProcessingInjectionContext} injectionContext
		 */
		const expectDefaultInjectionContext = ({ injectionContext, effect, context, unknownParamsArgs = [] }) => {
			expect(injectionContext.processExtraSkillConditions).toHaveBeenCalledWith(effect);
			expect(injectionContext.getPassiveTargetData).toHaveBeenCalledWith(effect, context);
			expect(injectionContext.createSourcesFromContext).toHaveBeenCalledWith(context);
			expect(injectionContext.createUnknownParamsValue).toHaveBeenCalledWith(...unknownParamsArgs);
		};

		const expectNoParamsBuffWithEffectAndContext = ({ effect, context, injectionContext, expectedSources }) => {
			const expectedResult = [baseBuffFactory({
				id: BuffId.NO_PARAMS_SPECIFIED,
			}, ['conditions', ...BUFF_TARGET_PROPS])];
			if (expectedSources) {
				expectedResult[0].sources = expectedSources;
			}

			const result = mappingFunction(effect, context, injectionContext);
			expect(result).toEqual(expectedResult);
		};

		const createArbitraryContext = () => ({
			source: 'arbitrary source',
			sourceId: 'arbitrary source id',
		});
		const createExpectedSourcesForArbitraryContext = () => ['arbitrary source-arbitrary source id'];
		const createSelfSingleTargetData = () => ({
			targetType: TargetType.Self,
			targetArea: TargetArea.Single,
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
					conditions: {},
					...createSelfSingleTargetData(), // single target by default
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
				const map = getPassiveEffectToBuffMapping();
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
		 * @description Common set of tests for passives that contain only one numerical parameter.
		 * @param {object} context
		 * @param {string} context.expectedOriginalId
		 * @param {string} context.expectedBuffId
		 * @param {string} context.effectKey
		 * @param {(param: string) => number} context.getExpectedValueFromParam
		 */
		const testPassiveWithSingleNumericalParameter = ({
			expectedOriginalId,
			expectedBuffId,
			effectKey,
			getExpectedValueFromParam = (param) => +param,
		}) => {
			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const effect = { params: '123' };
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: getExpectedValueFromParam(123),
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const effect = { params: '123,2,3,4' };
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: getExpectedValueFromParam(123),
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
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
				const effect = { [effectKey]: 456 };
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: 456,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('returns a no params buff if parsed value from params is zero', () => {
				const effect = { params: '0' };
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '200,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: getExpectedValueFromParam(200),
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 1] });
			});
		};

		/**
		 * @description Common set of tests for passives that contain only one numerical parameter and turn duration.
		 * @param {object} context
		 * @param {string} context.expectedOriginalId
		 * @param {string} context.expectedBuffId
		 * @param {string} context.effectKeyLow
		 * @param {string} context.effectKeyHigh
		 * @param {string} context.effectKeyChance
		 * @param {string} context.buffKeyLow
		 * @param {string} context.buffKeyHigh
		 * @param {number} context.defaultEffectChance
		 * @param {(param: string) => number} context.getExpectedValueFromParam
		 * @param {() => import('./buff-types').IBuffConditions} context.generateBaseConditions
		 */
		const testPassiveWithNumericalValueRangeAndChance = ({
			expectedOriginalId,
			expectedBuffId,
			effectKeyLow,
			effectKeyHigh,
			effectKeyChance,
			buffKeyLow,
			buffKeyHigh,
			defaultEffectChance = 0,
			getExpectedValueFromParam = (param) => +param,
			generateBaseConditions = () => ({}),
		}) => {
			/**
			 * @param {import('./buff-types').IBuff} buffToAddBaseConditions
			 */
			const applyBaseConditionsAsNeeded = (buffToAddBaseConditions) => {
				const baseConditions = generateBaseConditions();
				if (baseConditions && Object.keys(baseConditions).length > 0) {
					buffToAddBaseConditions.conditions = {
						...buffToAddBaseConditions.conditions,
						...baseConditions,
					};
				}
			};

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = '100,200,3';
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						[buffKeyLow]: getExpectedValueFromParam(100),
						[buffKeyHigh]: getExpectedValueFromParam(200),
						chance: 3,
					},
				})];
				applyBaseConditionsAsNeeded(expectedResult[0]);

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '100,200,3,4,5,6';
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: {
							[buffKeyLow]: getExpectedValueFromParam(100),
							[buffKeyHigh]: getExpectedValueFromParam(200),
							chance: 3,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_3: '4',
							param_4: '5',
							param_5: '6',
						},
					}),
				];
				applyBaseConditionsAsNeeded(expectedResult[0]);

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = {
					[effectKeyLow]: 3,
					[effectKeyHigh]: 4,
					[effectKeyChance]: 5,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						[buffKeyLow]: 3,
						[buffKeyHigh]: 4,
						chance: 5,
					},
				})];
				applyBaseConditionsAsNeeded(expectedResult[0]);

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = {
					[effectKeyLow]: '6',
					[effectKeyHigh]: '7',
					[effectKeyChance]: '8',
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						[buffKeyLow]: 6,
						[buffKeyHigh]: 7,
						chance: 8,
					},
				})];
				applyBaseConditionsAsNeeded(expectedResult[0]);

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
					const expectedDefaultValue = effectProp.includes('chance') ? defaultEffectChance : 0;
					it(`defaults to 0 for missing ${effectProp} value`, () => {
						const effect = Object.keys(effectPropToResultPropMapping)
							.filter((prop) => prop !== effectProp)
							.reduce((acc, prop) => {
								acc[prop] = 123;
								return acc;
							}, {});
						const expectedValues = Object.entries(effectPropToResultPropMapping)
							.reduce((acc, [localEffectProp, resultProp]) => {
								acc[resultProp] = localEffectProp === effectProp ? expectedDefaultValue : 123;
								return acc;
							}, {});
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							value: expectedValues,
						})];
						applyBaseConditionsAsNeeded(expectedResult[0]);

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				it(`defaults all non-chance properties to 0 and chance to ${defaultEffectChance} for non-number values`, () => {
					const effect = Object.keys(effectPropToResultPropMapping)
						.reduce((acc, prop) => {
							acc[prop] = 'not a number';
							return acc;
						}, {});
					if (defaultEffectChance === 0) {
						expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
					} else {
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							value: {
								[buffKeyLow]: 0,
								[buffKeyHigh]: 0,
								chance: defaultEffectChance,
							},
						})];
						applyBaseConditionsAsNeeded(expectedResult[0]);

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					}
				});

				if (defaultEffectChance === 0) {
					it('returns a no params buff when no parameters are given', () => {
						expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
					});

					it('defaults values for effect params to 0 if they are non-number or missing', () => {
						const effect = { params: 'non-number' };
						expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
					});
				}
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,0,1,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: {
							[buffKeyLow]: 0,
							[buffKeyHigh]: 0,
							chance: 1,
						},
						conditions: {
							...arbitraryConditionValue,
						},
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];
				applyBaseConditionsAsNeeded(expectedResult[0]);

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 3] });
			});
		};

		/**
		 * @description Common set of tests for conditional passives that use only one numerical condition for activation.
		 * @param {object} context
		 * @param {string} context.expectedOriginalId
		 * @param {string} context.expectedBuffId
		 * @param {(param: number) => import('./buff-types').IBuffConditions} context.getExpectedConditionsFromParam
		 */
		const testConditionalPassiveWithSingleNumericalCondition = ({
			expectedOriginalId,
			expectedBuffId,
			getExpectedConditionsFromParam = () => ({}),
		}) => {
			const arbitraryKnownConditionalId = `arbitrary conditional id for passive ${expectedOriginalId}`;
			const getArbitraryBuffsForConditionalEffect = () => [{ arbitrary: `conditional buff for passive ${expectedOriginalId}` }];
			let mockConditionalEffectConversionFunctionSpy;
			let injectionContext;

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);

				mockConditionalEffectConversionFunctionSpy = jasmine.createSpy('mockConditionalEffectConversionFunctionSpy');
				mockConditionalEffectConversionFunctionSpy.and.callFake(() => getArbitraryBuffsForConditionalEffect());
				injectionContext = { convertConditionalEffectToBuffs: mockConditionalEffectConversionFunctionSpy };
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = `${arbitraryKnownConditionalId},2,3,4,5`;
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						triggeredBuffs: getArbitraryBuffsForConditionalEffect(),
						maxTriggerCount: 3,
					},
					conditions: getExpectedConditionsFromParam(4),
				})];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext(), injectionContext);
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `${arbitraryKnownConditionalId},2,3,4,5,6,7,8`;
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: {
							triggeredBuffs: getArbitraryBuffsForConditionalEffect(),
							maxTriggerCount: 3,
						},
						conditions: getExpectedConditionsFromParam(4),
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_5: '6',
							param_6: '7',
							param_7: '8',
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext(), injectionContext);
				expect(result).toEqual(expectedResult);
			});

			it('calls corresponding conditional effect conversion function defined in injection context', () => {
				const params = `${arbitraryKnownConditionalId},2&3&4,3,4,5`;
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						triggeredBuffs: getArbitraryBuffsForConditionalEffect(),
						maxTriggerCount: 3,
					},
					conditions: getExpectedConditionsFromParam(4),
				})];

				const effect = { params };
				const context = createArbitraryContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expect(mockConditionalEffectConversionFunctionSpy).toHaveBeenCalledWith({
					id: arbitraryKnownConditionalId,
					params: '2&3&4',
					turnDuration: 5,
				}, context);
			});

			it('calls corresponding conditional effect conversion function when not defined via injection context', () => {
				const params = `${arbitraryKnownConditionalId},2&3&4,3,4,5`;
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						triggeredBuffs: getArbitraryBuffsForConditionalEffect(),
						maxTriggerCount: 3,
					},
					conditions: getExpectedConditionsFromParam(4),
				})];

				getConditionalEffectToBuffMapping(true).set(arbitraryKnownConditionalId, mockConditionalEffectConversionFunctionSpy);

				const effect = { params };
				const context = createArbitraryContext();
				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
				expect(mockConditionalEffectConversionFunctionSpy).toHaveBeenCalledWith({
					id: arbitraryKnownConditionalId,
					params: '2&3&4',
					turnDuration: 5,
				}, context);
			});

			it('defaults numerical values to 0 if they are missing or non-number', () => {
				const params = `${arbitraryKnownConditionalId},params,not a number,not a number,not a number`;
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						triggeredBuffs: getArbitraryBuffsForConditionalEffect(),
						maxTriggerCount: 0,
					},
					conditions: getExpectedConditionsFromParam(0),
				})];

				const effect = { params };
				const context = createArbitraryContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expect(mockConditionalEffectConversionFunctionSpy).toHaveBeenCalledWith({
					id: arbitraryKnownConditionalId,
					params: 'params',
					turnDuration: 0,
				}, context);
			});

			it('returns a no params buff when no parameters are given', () => {
				mockConditionalEffectConversionFunctionSpy.and.returnValue([]);
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext(), injectionContext });
			});

			it('returns a no params buff if no triggered buffs are found', () => {
				const params = `${arbitraryKnownConditionalId},2,3,4,5`;
				mockConditionalEffectConversionFunctionSpy.and.returnValue([]);
				expectNoParamsBuffWithEffectAndContext({ effect: { params }, context: createArbitraryContext(), injectionContext });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: `${arbitraryKnownConditionalId},2,3,456,5,789`,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: {
							triggeredBuffs: getArbitraryBuffsForConditionalEffect(),
							maxTriggerCount: 3,
						},
						conditions: {
							...arbitraryConditionValue,
							...getExpectedConditionsFromParam(456),
						},
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				injectionContext = { ...injectionContext, ...createDefaultInjectionContext() };
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 5] });
			});
		};

		/**
		 * @description Common set of tests for conditional BC fill passives that use only one numerical condition for activation.
		 * @param {object} context
		 * @param {string} context.expectedOriginalId
		 * @param {string} context.expectedFlatFillBuffId
		 * @param {string} context.expectedPercentFillBuffId
		 * @param {string} context.flatFillEffectKey
		 * @param {string} context.conditionalThresholdEffectKey
		 * @param {(param: number) => import('./buff-types').IBuffConditions} context.getExpectedConditionsFromParam
		 */
		const testConditionalBcFillWithSingleNumericalCondition = ({
			expectedOriginalId,
			expectedFlatFillBuffId,
			expectedPercentFillBuffId,
			flatFillEffectKey,
			conditionalThresholdEffectKey,
			getExpectedConditionsFromParam = () => ({}),
		}) => {
			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedFlatFillBuffId, expectedPercentFillBuffId]);

			it('uses the params property when it exists', () => {
				const params = '100,200,2';
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatFillBuffId,
						value: 1,
						conditions: getExpectedConditionsFromParam(2),
					}),
					baseBuffFactory({
						id: expectedPercentFillBuffId,
						value: 200,
						conditions: getExpectedConditionsFromParam(2),
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '100,200,3,4,5,6';
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatFillBuffId,
						value: 1,
						conditions: getExpectedConditionsFromParam(3),
					}),
					baseBuffFactory({
						id: expectedPercentFillBuffId,
						value: 200,
						conditions: getExpectedConditionsFromParam(3),
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_3: '4',
							param_4: '5',
							param_5: '6',
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = {
					[flatFillEffectKey]: 3,
					[conditionalThresholdEffectKey]: 4,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedFlatFillBuffId,
					value: 3,
					conditions: getExpectedConditionsFromParam(4),
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = {
					[flatFillEffectKey]: '5',
					[conditionalThresholdEffectKey]: '6',
				};
				const expectedResult = [baseBuffFactory({
					id: expectedFlatFillBuffId,
					value: 5,
					conditions: getExpectedConditionsFromParam(6),
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are missing', () => {
				it('only returns percent fill value if flat fill value is 0', () => {
					const params = '0,45600,789';
					const expectedResult = [baseBuffFactory({
						id: expectedPercentFillBuffId,
						value: 45600,
						conditions: getExpectedConditionsFromParam(789),
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('only returns flat fill value if percent fill value is 0', () => {
					const params = '12300,0,789';
					const expectedResult = [baseBuffFactory({
						id: expectedFlatFillBuffId,
						value: 123,
						conditions: getExpectedConditionsFromParam(789),
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for missing threshold value', () => {
					const params = '12300,45600';
					const expectedResult = [
						baseBuffFactory({
							id: expectedFlatFillBuffId,
							value: 123,
							conditions: getExpectedConditionsFromParam(0),
						}),
						baseBuffFactory({
							id: expectedPercentFillBuffId,
							value: 45600,
							conditions: getExpectedConditionsFromParam(0),
						}),
					];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for missing threshold value when params property does not exist', () => {
					const effect = {
						[flatFillEffectKey]: 456,
					};
					const expectedResult = [baseBuffFactory({
						id: expectedFlatFillBuffId,
						value: 456,
						conditions: getExpectedConditionsFromParam(0),
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a no params buff if all effect properties are non-number values', () => {
					const effect = {
						[flatFillEffectKey]: 'not a number',
						[conditionalThresholdEffectKey]: 'not a number',
					};
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('returns a no params buff if the effect params are non-number or missing', () => {
					const effect = { params: 'non-number' };
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '100,200,3,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatFillBuffId,
						sources: arbitrarySourceValue,
						value: 1,
						conditions: {
							...arbitraryConditionValue,
							...getExpectedConditionsFromParam(3),
						},
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: expectedPercentFillBuffId,
						sources: arbitrarySourceValue,
						value: 200,
						conditions: {
							...arbitraryConditionValue,
							...getExpectedConditionsFromParam(3),
						},
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 3] });
			});
		};

		describe('passive 1', () => {
			const expectedOriginalId = '1';
			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `passive:1:${stat}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:1:${stat}`,
						value: +(splitParams[index]),
					});
				});

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,6,7,8';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:1:${stat}`,
						value: +(splitParams[index]),
					});
				}).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
					value: {
						param_5: '6',
						param_6: '7',
						param_7: '8',
					},
				})]);

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to stat-specific properties when the params property does not exist', () => {
				const mockValues = [6, 7, 8, 9, 10];
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat, index) => {
					acc[`${stat}% buff`] = mockValues[index];
					return acc;
				}, {});

				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:1:${stat}`,
						value: mockValues[index],
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			STAT_PARAMS_ORDER.forEach((statCase) => {
				it(`returns only value for ${statCase} if it is non-zero and other stats are zero`, () => {
					const params = STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0').join(',');
					const expectedResult = [baseBuffFactory({
						id: `passive:1:${statCase}`,
						value: 123,
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`returns only value for ${statCase} if it is non-zero and other stats are zero and params property does not exist`, () => {
					const effect = { [`${statCase}% buff`]: 123 };
					const expectedResult = [baseBuffFactory({
						id: `passive:1:${statCase}`,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('defaults all effect properties to 0 for non-number values', () => {
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat) => {
					acc[`${stat}% buff`] = 'not a number';
					return acc;
				}, {});
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,0,0,0,456,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:1:hp',
						sources: arbitrarySourceValue,
						value: 456,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 5] });
			});
		});

		describe('passive 2', () => {
			const expectedOriginalId = '2';
			const ELEMENT_MAPPING = {
				1: UnitElement.Fire,
				2: UnitElement.Water,
				3: UnitElement.Earth,
				4: UnitElement.Thunder,
				5: UnitElement.Light,
				6: UnitElement.Dark,
				X: 'omniParadigm',
			};

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `passive:2:elemental-${stat}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6,7';
				const splitParams = params.split(',');
				const expectedResult = [UnitElement.Fire, UnitElement.Water].map((element) => {
					return STAT_PARAMS_ORDER.map((stat, index) => {
						return baseBuffFactory({
							id: `passive:2:elemental-${stat}`,
							value: +(splitParams[index + 2]),
							conditions: {
								targetElements: [element],
							},
						});
					});
				}).reduce((acc, val) => acc.concat(val), []);

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '5,6,3,4,5,6,7,8,9,10';
				const splitParams = params.split(',');
				const expectedResult = [UnitElement.Light, UnitElement.Dark].map((element) => {
					return STAT_PARAMS_ORDER.map((stat, index) => {
						return baseBuffFactory({
							id: `passive:2:elemental-${stat}`,
							value: +(splitParams[index + 2]),
							conditions: {
								targetElements: [element],
							},
						});
					});
				}).reduce((acc, val) => acc.concat(val), [])
					.concat([baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_7: '8',
							param_8: '9',
							param_9: '10',
						},
					})]);

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when the params property does not exist', () => {
				const mockValues = [8, 9, 10, 11, 12];
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat, index) => {
					acc[`${stat}% buff`] = mockValues[index];
					return acc;
				}, {});
				effect['elements buffed'] = ['element1', 'element2', 'element3']; // elements are taken at face value

				const expectedResult = ['element1', 'element2', 'element3'].map((element) => {
					return STAT_PARAMS_ORDER.map((stat, index) => {
						return baseBuffFactory({
							id: `passive:2:elemental-${stat}`,
							value: mockValues[index],
							conditions: {
								targetElements: [element],
							},
						});
					});
				}).reduce((acc, val) => acc.concat(val), []);

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			STAT_PARAMS_ORDER.forEach((statCase) => {
				Object.entries(ELEMENT_MAPPING).forEach(([elementKey, elementValue]) => {
					it(`returns only value for ${statCase} and ${elementValue} if it is non-zero and other stats are zero and only one element is specified`, () => {
						const params = [elementKey, '0', ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0')].join(',');
						const expectedResult = [baseBuffFactory({
							id: `passive:2:elemental-${statCase}`,
							value: 123,
							conditions: {
								targetElements: [elementValue],
							},
						})];

						const effect = { params };
						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				it(`converts element values with no mapping to "unknown" and the only non-zero stat is ${statCase}`, () => {
					const params = ['123', '456', ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0')].join(',');
					const expectedResult = [
						baseBuffFactory({
							id: `passive:2:elemental-${statCase}`,
							value: 123,
							conditions: {
								targetElements: ['unknown'],
							},
						}),
						baseBuffFactory({
							id: `passive:2:elemental-${statCase}`,
							value: 123,
							conditions: {
								targetElements: ['unknown'],
							},
						}),
					];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`outputs stat buffs when no elements are given and the only non-zero stat is ${statCase}`, () => {
					const params = ['0', '0', ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0')].join(',');
					const expectedResult = [baseBuffFactory({
						id: `passive:2:elemental-${statCase}`,
						value: 123,
						conditions: {
							targetElements: ['unknown'],
						},
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('outputs stat buffs when no elements are given', () => {
				const params = ['0', '0', ...STAT_PARAMS_ORDER.map((stat, index) => index + 1)].join(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:2:elemental-${stat}`,
						value: index + 1,
						conditions: {
							targetElements: ['unknown'],
						},
					});
				});

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('outputs stat buffs when no elements are given and params property does not exist', () => {
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat, index) => {
					acc[`${stat}% buff`] = index + 1;
					return acc;
				}, {});
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:2:elemental-${stat}`,
						value: index + 1,
						conditions: {
							targetElements: ['unknown'],
						},
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('defaults all effect properties to 0 for non-number stat values', () => {
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat) => {
					acc[`${stat}% buff`] = 'not a number';
					return acc;
				}, {});
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,0,0,0,0,0,456,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:2:elemental-hp',
						sources: arbitrarySourceValue,
						value: 456,
						conditions: {
							...arbitraryConditionValue,
							targetElements: ['unknown'],
						},
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 7] });
			});
		});

		describe('passive 3', () => {
			const expectedOriginalId = '3';
			const UNIT_TYPE_MAPPING = {
				1: UnitType.Lord,
				2: UnitType.Anima,
				3: UnitType.Breaker,
				4: UnitType.Guardian,
				5: UnitType.Oracle,
				6: UnitType.Rex,
			};

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `passive:3:type based-${stat}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:3:type based-${stat}`,
						value: +(splitParams[index + 1]),
						conditions: {
							targetUnitType: UnitType.Lord,
						},
					});
				});

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '5,2,3,4,5,6,7,8,9';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:3:type based-${stat}`,
						value: +(splitParams[index + 1]),
						conditions: {
							targetUnitType: UnitType.Oracle,
						},
					});
				}).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
					value: {
						param_6: '7',
						param_7: '8',
						param_8: '9',
					},
				})]);

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when the params property does not exist', () => {
				const mockValues = [8, 9, 10, 11, 12];
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat, index) => {
					acc[`${stat}% buff`] = mockValues[index];
					return acc;
				}, {});
				effect['unit type buffed'] = 'arbitrary type'; // types are taken at face value

				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:3:type based-${stat}`,
						value: mockValues[index],
						conditions: {
							targetUnitType: 'arbitrary type',
						},
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			STAT_PARAMS_ORDER.forEach((statCase) => {
				Object.entries(UNIT_TYPE_MAPPING).forEach(([typeKey, typeValue]) => {
					it(`returns only value for ${statCase} and ${typeValue} if it is non-zero and other stats are zero`, () => {
						const params = [typeKey, ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0')].join(',');
						const expectedResult = [baseBuffFactory({
							id: `passive:3:type based-${statCase}`,
							value: 123,
							conditions: {
								targetUnitType: typeValue,
							},
						})];

						const effect = { params };
						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				it(`converts unit type values with no mapping to "unknown" and the only non-zero stat is ${statCase}`, () => {
					const params = ['123', ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0')].join(',');
					const expectedResult = [baseBuffFactory({
						id: `passive:3:type based-${statCase}`,
						value: 123,
						conditions: {
							targetUnitType: 'unknown',
						},
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`outputs stat buffs when no unit types are specified and the only non-zero stat is ${statCase}`, () => {
					const params = ['0', ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0')].join(',');
					const expectedResult = [baseBuffFactory({
						id: `passive:3:type based-${statCase}`,
						value: 123,
						conditions: {
							targetUnitType: 'unknown',
						},
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('outputs stat buffs when no unit types are given', () => {
				const params = ['0', ...STAT_PARAMS_ORDER.map((stat, index) => index + 1)].join(',');

				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:3:type based-${stat}`,
						value: index + 1,
						conditions: {
							targetUnitType: 'unknown',
						},
					});
				});

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('defaults all effect properties to 0 for non-number values', () => {
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat) => {
					acc[`${stat}% buff`] = 'not a number';
					return acc;
				}, {});
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,0,0,0,0,456,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:3:type based-hp',
						sources: arbitrarySourceValue,
						value: 456,
						conditions: {
							...arbitraryConditionValue,
							targetUnitType: 'unknown',
						},
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 6] });
			});
		});

		describe('passive 4', () => {
			const expectedOriginalId = '4';

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(AILMENTS_ORDER.map((ailment) => `passive:4:resist-${ailment}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6';
				const splitParams = params.split(',');
				const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
					return baseBuffFactory({
						id: `passive:4:resist-${ailment}`,
						value: +(splitParams[index]),
					});
				});

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,6,7,8,9';
				const splitParams = params.split(',');
				const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
					return baseBuffFactory({
						id: `passive:4:resist-${ailment}`,
						value: +(splitParams[index]),
					});
				}).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
					value: {
						param_6: '7',
						param_7: '8',
						param_8: '9',
					},
				})]);

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to ailment-specific properties when the params property does not exist', () => {
				const mockValues = [7, 8, 9, 10, 11, 12];
				const effect = AILMENTS_ORDER.reduce((acc, ailment, index) => {
					acc[`${ailment !== 'weak' ? ailment : 'weaken'} resist%`] = mockValues[index];
					return acc;
				}, {});

				const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
					return baseBuffFactory({
						id: `passive:4:resist-${ailment}`,
						value: mockValues[index],
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			AILMENTS_ORDER.forEach((ailmentCase) => {
				it(`returns only value for ${ailmentCase} if it is non-zero and other stats are zero`, () => {
					const params = AILMENTS_ORDER.map((ailment) => ailment === ailmentCase ? '123' : '0').join(',');
					const expectedResult = [baseBuffFactory({
						id: `passive:4:resist-${ailmentCase}`,
						value: 123,
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`returns only value for ${ailmentCase} if it is non-zero and other stats are zero and params property does not exist`, () => {
					const effect = AILMENTS_ORDER.reduce((acc, ailment) => {
						acc[`${ailment !== 'weak' ? ailment : 'weaken'} resist%`] = ailment !== ailmentCase ? 0 : 123;
						return acc;
					}, {});
					const expectedResult = [baseBuffFactory({
						id: `passive:4:resist-${ailmentCase}`,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`returns only value for ${ailmentCase} if the only present stat are zero and params property does not exist`, () => {
					const effect = { [`${ailmentCase !== 'weak' ? ailmentCase : 'weaken'} resist%`]: 123 };
					const expectedResult = [baseBuffFactory({
						id: `passive:4:resist-${ailmentCase}`,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('defaults all params properties to 0 for non-number values', () => {
				const effect = { params: 'not a number' };
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('defaults all effect properties to 0 for non-number values and params property does not exist', () => {
				const effect = AILMENTS_ORDER.reduce((acc, ailment) => {
					acc[`${ailment !== 'weak' ? ailment : 'weaken'} resist%`] = 'not a number';
					return acc;
				}, {});
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,0,0,0,0,456,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:4:resist-paralysis',
						sources: arbitrarySourceValue,
						value: 456,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 6] });
			});
		});

		describe('passive 5', () => {
			const expectedOriginalId = '5';
			const ELEMENT_MAPPING = {
				1: UnitElement.Fire,
				2: UnitElement.Water,
				3: UnitElement.Earth,
				4: UnitElement.Thunder,
				5: UnitElement.Light,
				6: UnitElement.Dark,
			};

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(Object.values(ELEMENT_MAPPING).concat(['unknown']).map((elem) => `passive:5:mitigate-${elem}`));

			it('uses the params property when it exists', () => {
				const params = '1,2';
				const expectedResult = [baseBuffFactory({
					id: 'passive:5:mitigate-fire',
					value: 2,
				})];

				const effect = { params };
				const context = createArbitraryContext();
				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '6,1,3,4,5';
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:5:mitigate-dark',
						value: 1,
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_2: '3',
							param_3: '4',
							param_4: '5',
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to stat-specific properties when the params property does not exist', () => {
				const effect = { 'water resist%': 5 };

				const expectedResult = [baseBuffFactory({
					id: 'passive:5:mitigate-water',
					value: 5,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			Object.entries(ELEMENT_MAPPING).forEach(([knownElementKey, knownElementValue]) => {
				it(`parses raw value for ${knownElementValue} in params property`, () => {
					const params = `${knownElementKey},123`;
					const expectedResult = [baseBuffFactory({
						id: `passive:5:mitigate-${knownElementValue}`,
						value: 123,
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`parses value for ${knownElementValue} when not given params property and value is non-zero`, () => {
					const effect = { [`${knownElementValue} resist%`]: 456 };
					const expectedResult = [baseBuffFactory({
						id: `passive:5:mitigate-${knownElementValue}`,
						value: 456,
					})];

					const context = createArbitraryContext();
					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});

				it(`returns a no params buff for ${knownElementValue} when not given params property and value is zero`, () => {
					const effect = { [`${knownElementValue} resist%`]: 0 };
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('defaults to unknown element if corresponding element value cannot be found from parsed params', () => {
				const params = 'not-an-element,789';
				const expectedResult = [baseBuffFactory({
					id: 'passive:5:mitigate-unknown',
					value: 789,
				})];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff if parsed mitigation value from params is zero', () => {
				const params = '3,0';
				const effect = { params };
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('returns a no params buff if no elemental value is found in effect without params', () => {
				const effect = { 'fake-element resist%': 123 };
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '5,6,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:5:mitigate-light',
						sources: arbitrarySourceValue,
						value: 6,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 2] });
			});
		});

		describe('passive 8', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '8',
				expectedBuffId: 'passive:8:mitigation',
				effectKey: 'dmg% mitigation',
			});
		});

		describe('passive 9', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '9',
				expectedBuffId: 'passive:9:gradual bc fill',
				effectKey: 'bc fill per turn',
			});
		});

		describe('passive 10', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '10',
				expectedBuffId: 'passive:10:hc efficacy',
				effectKey: 'hc effectiveness%',
			});
		});

		describe('passive 11', () => {
			const STAT_PARAMS_ORDER = ['atk', 'def', 'rec', 'crit'];
			const expectedOriginalId = '11';
			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `passive:11:hp conditional-${stat}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,1';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:11:hp conditional-${stat}`,
						value: +(splitParams[index]),
						conditions: {
							hpGreaterThanOrEqualTo: 5,
						},
					});
				});

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,2,7,8,9';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:11:hp conditional-${stat}`,
						value: +(splitParams[index]),
						conditions: {
							hpLessThanOrEqualTo: 5,
						},
					});
				}).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
					value: {
						param_6: '7',
						param_7: '8',
						param_8: '9',
					},
				})]);

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to stat-specific properties when the params property does not exist', () => {
				const mockValues = [5, 6, 7, 8];
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat, index) => {
					acc[`${stat}% buff`] = mockValues[index];
					return acc;
				}, {});
				effect[HP_ABOVE_EFFECT_KEY] = 9;

				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:11:hp conditional-${stat}`,
						value: mockValues[index],
						conditions: {
							hpGreaterThanOrEqualTo: 9,
						},
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			STAT_PARAMS_ORDER.forEach((statCase) => {
				[1, 2].forEach((hpThresholdCase) => {
					it(`returns only value for ${statCase} if it is non-zero and other stats are zero and hp threshold polarity is ${hpThresholdCase === 1 ? 'above' : 'below'}`, () => {
						const params = STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0').concat(['456', hpThresholdCase]).join(',');
						const expectedConditions = {};
						if (hpThresholdCase === 1) {
							expectedConditions.hpGreaterThanOrEqualTo = 456;
						} else {
							expectedConditions.hpLessThanOrEqualTo = 456;
						}
						const expectedResult = [baseBuffFactory({
							id: `passive:11:hp conditional-${statCase}`,
							value: 123,
							conditions: expectedConditions,
						})];

						const effect = { params };
						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});

					it(`returns only value for ${statCase} if it is non-zero and other stats are zero and hp threshold polarity is ${hpThresholdCase === 1 ? 'above' : 'below'} and params property does not exist`, () => {
						const effect = {
							[`${statCase}% buff`]: 123,
							[hpThresholdCase === 1 ? HP_ABOVE_EFFECT_KEY : HP_BELOW_EFFECT_KEY]: 456,
						};
						const expectedConditions = {};
						if (hpThresholdCase === 1) {
							expectedConditions.hpGreaterThanOrEqualTo = 456;
						} else {
							expectedConditions.hpLessThanOrEqualTo = 456;
						}
						const expectedResult = [baseBuffFactory({
							id: `passive:11:hp conditional-${statCase}`,
							value: 123,
							conditions: expectedConditions,
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('returns a no params buff if all stats are 0', () => {
				const params = '0,0,0,0,2,1';
				const effect = { params };
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,0,0,1,456,1,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:11:hp conditional-crit',
						sources: arbitrarySourceValue,
						value: 1,
						conditions: {
							...arbitraryConditionValue,
							hpGreaterThanOrEqualTo: 456,
						},
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 6] });
			});
		});

		describe('passive 12', () => {
			const expectedOriginalId = '12';

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(DROP_TYPE_ORDER.map((dropType) => `passive:12:hp conditional drop boost-${dropType}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6,1';
				const splitParams = params.split(',');
				const expectedResult = DROP_TYPE_ORDER.map((dropType, index) => {
					return baseBuffFactory({
						id: `passive:12:hp conditional drop boost-${dropType}`,
						value: +(splitParams[index]),
						conditions: {
							hpGreaterThanOrEqualTo: 6,
						},
					});
				});

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,6,2,8,9,10';
				const splitParams = params.split(',');
				const expectedResult = DROP_TYPE_ORDER.map((dropType, index) => {
					return baseBuffFactory({
						id: `passive:12:hp conditional drop boost-${dropType}`,
						value: +(splitParams[index]),
						conditions: {
							hpLessThanOrEqualTo: 6,
						},
					});
				}).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
					value: {
						param_7: '8',
						param_8: '9',
						param_9: '10',
					},
				})]);

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to rate-specific properties when the params property does not exist', () => {
				const mockValues = [6, 7, 8, 9, 10];
				const effect = DROP_TYPE_ORDER.reduce((acc, dropType, index) => {
					acc[`${dropType} drop rate% buff`] = mockValues[index];
					return acc;
				}, {});
				effect[HP_ABOVE_EFFECT_KEY] = 11;

				const expectedResult = DROP_TYPE_ORDER.map((dropType, index) => {
					return baseBuffFactory({
						id: `passive:12:hp conditional drop boost-${dropType}`,
						value: mockValues[index],
						conditions: {
							hpGreaterThanOrEqualTo: 11,
						},
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			DROP_TYPE_ORDER.forEach((dropTypeCase) => {
				[1, 2].forEach((hpThresholdCase) => {
					it(`returns only value for ${dropTypeCase} if it is non-zero and other rates are zero and hp threshold polarity is ${hpThresholdCase === 1 ? 'above' : 'below'}`, () => {
						const params = DROP_TYPE_ORDER.map((dropType) => dropType === dropTypeCase ? '123' : '0').concat(['456', hpThresholdCase]).join(',');
						const expectedConditions = {};
						if (hpThresholdCase === 1) {
							expectedConditions.hpGreaterThanOrEqualTo = 456;
						} else {
							expectedConditions.hpLessThanOrEqualTo = 456;
						}
						const expectedResult = [baseBuffFactory({
							id: `passive:12:hp conditional drop boost-${dropTypeCase}`,
							value: 123,
							conditions: expectedConditions,
						})];

						const effect = { params };
						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});

					it(`returns only value for ${dropTypeCase} if it is non-zero and other rates are zero and hp threshold polarity is ${hpThresholdCase === 1 ? 'above' : 'below'} and params property does not exist`, () => {
						const effect = {
							[`${dropTypeCase} drop rate% buff`]: 123,
							[hpThresholdCase === 1 ? HP_ABOVE_EFFECT_KEY : HP_BELOW_EFFECT_KEY]: 456,
						};
						const expectedConditions = {};
						if (hpThresholdCase === 1) {
							expectedConditions.hpGreaterThanOrEqualTo = 456;
						} else {
							expectedConditions.hpLessThanOrEqualTo = 456;
						}
						const expectedResult = [baseBuffFactory({
							id: `passive:12:hp conditional drop boost-${dropTypeCase}`,
							value: 123,
							conditions: expectedConditions,
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('returns a no params buff if all rates are 0', () => {
				const params = '0,0,0,0,0,2,1';
				const effect = { params };
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,0,0,0,1,456,1,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:12:hp conditional drop boost-karma',
						sources: arbitrarySourceValue,
						value: 1,
						conditions: {
							...arbitraryConditionValue,
							hpGreaterThanOrEqualTo: 456,
						},
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 7] });
			});
		});

		describe('passive 13', () => {
			testPassiveWithNumericalValueRangeAndChance({
				expectedOriginalId: '13',
				expectedBuffId: 'passive:13:bc fill on enemy defeat',
				effectKeyLow: 'bc fill on enemy defeat low',
				effectKeyHigh: 'bc fill on enemy defeat high',
				effectKeyChance: 'bc fill on enemy defeat%',
				buffKeyLow: 'fillLow',
				buffKeyHigh: 'fillHigh',
				getExpectedValueFromParam: (param) => +param / 100,
				generateBaseConditions: () => ({ onEnemyDefeat: true }),
			});
		});

		describe('passive 14', () => {
			const expectedBuffId = 'passive:14:chance mitigation';
			const expectedOriginalId = '14';

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = '1,2';
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						value: 1,
						chance: 2,
					},
				})];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5';
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: {
							value: 1,
							chance: 2,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_2: '3',
							param_3: '4',
							param_4: '5',
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = {
					'dmg reduction%': 3,
					'dmg reduction chance%': 4,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						value: 3,
						chance: 4,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = {
					'dmg reduction%': '5',
					'dmg reduction chance%': '6',
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						value: 5,
						chance: 6,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are missing', () => {
				const effectPropToResultPropMapping = {
					'dmg reduction%': 'value',
					'dmg reduction chance%': 'chance',
				};

				Object.keys(effectPropToResultPropMapping).forEach((effectProp) => {
					it(`defaults to 0 for missing ${effectProp} value`, () => {
						const effect = Object.keys(effectPropToResultPropMapping)
							.filter((prop) => prop !== effectProp)
							.reduce((acc, prop) => {
								acc[prop] = 123;
								return acc;
							}, {});
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
					expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
				});

				it('defaults all effect properties to 0 for non-number values', () => {
					const effect = Object.keys(effectPropToResultPropMapping)
						.reduce((acc, prop) => {
							acc[prop] = 'not a number';
							return acc;
						}, {});
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('defaults values for effect params to 0 if they are non-number or missing', () => {
					const effect = { params: 'non-number' };
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '1,0,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: {
							value: 1,
							chance: 0,
						},
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 2] });
			});
		});

		describe('passive 15', () => {
			testPassiveWithNumericalValueRangeAndChance({
				expectedOriginalId: '15',
				expectedBuffId: 'passive:15:heal on enemy defeat',
				effectKeyLow: 'hp% recover on enemy defeat low',
				effectKeyHigh: 'hp% recover on enemy defeat high',
				effectKeyChance: 'hp% recover on enemy defeat chance%',
				buffKeyLow: 'healLow',
				buffKeyHigh: 'healHigh',
				defaultEffectChance: 100,
				generateBaseConditions: () => ({ onEnemyDefeat: true }),
			});
		});

		describe('passive 16', () => {
			const expectedBuffId = 'passive:16:heal on win';
			const expectedOriginalId = '16';

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = '1,2';
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						healLow: 1,
						healHigh: 2,
					},
					conditions: {
						onBattleWin: true,
					},
				})];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5';
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: {
							healLow: 1,
							healHigh: 2,
						},
						conditions: {
							onBattleWin: true,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_2: '3',
							param_3: '4',
							param_4: '5',
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = {
					'hp% recover on battle win low': 3,
					'hp% recover on battle win high': 4,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						healLow: 3,
						healHigh: 4,
					},
					conditions: {
						onBattleWin: true,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = {
					'hp% recover on battle win low': '6',
					'hp% recover on battle win high': '7',
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						healLow: 6,
						healHigh: 7,
					},
					conditions: {
						onBattleWin: true,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are missing', () => {
				const effectPropToResultPropMapping = {
					'hp% recover on battle win low': 'healLow',
					'hp% recover on battle win high': 'healHigh',
				};

				Object.keys(effectPropToResultPropMapping).forEach((effectProp) => {
					it(`defaults to 0 for missing ${effectProp} value`, () => {
						const effect = Object.keys(effectPropToResultPropMapping)
							.filter((prop) => prop !== effectProp)
							.reduce((acc, prop) => {
								acc[prop] = 123;
								return acc;
							}, {});
						const expectedValues = Object.entries(effectPropToResultPropMapping)
							.reduce((acc, [localEffectProp, resultProp]) => {
								acc[resultProp] = localEffectProp === effectProp ? 0 : 123;
								return acc;
							}, {});
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							value: expectedValues,
							conditions: {
								onBattleWin: true,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				it('returns a no params buff when no parameters are given', () => {
					expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
				});

				it('defaults all effect properties to 0 for non-number values', () => {
					const effect = Object.keys(effectPropToResultPropMapping)
						.reduce((acc, prop) => {
							acc[prop] = 'not a number';
							return acc;
						}, {});
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('defaults values for effect params to 0 if they are non-number or missing', () => {
					const effect = { params: 'non-number' };
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,1,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: {
							healLow: 0,
							healHigh: 1,
						},
						conditions: {
							...arbitraryConditionValue,
							onBattleWin: true,
						},
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 2] });
			});
		});

		describe('passive 17', () => {
			testPassiveWithNumericalValueRangeAndChance({
				expectedOriginalId: '17',
				expectedBuffId: 'passive:17:hp absorb',
				effectKeyLow: 'hp drain% low',
				effectKeyHigh: 'hp drain% high',
				effectKeyChance: 'hp drain chance%',
				buffKeyLow: 'drainHealLow',
				buffKeyHigh: 'drainHealHigh',
			});
		});

		describe('passive 19', () => {
			const expectedOriginalId = '19';

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(DROP_TYPE_ORDER.map((dropType) => `passive:19:drop boost-${dropType}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5';
				const splitParams = params.split(',');
				const expectedResult = DROP_TYPE_ORDER.map((dropType, index) => {
					return baseBuffFactory({
						id: `passive:19:drop boost-${dropType}`,
						value: +(splitParams[index]),
					});
				});

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,6,7,8';
				const splitParams = params.split(',');
				const expectedResult = DROP_TYPE_ORDER.map((dropType, index) => {
					return baseBuffFactory({
						id: `passive:19:drop boost-${dropType}`,
						value: +(splitParams[index]),
					});
				}).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
					value: {
						param_5: '6',
						param_6: '7',
						param_7: '8',
					},
				})]);

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to stat-specific properties when the params property does not exist', () => {
				const mockValues = [6, 7, 8, 9, 10];
				const effect = DROP_TYPE_ORDER.reduce((acc, dropType, index) => {
					acc[`${dropType} drop rate% buff`] = mockValues[index];
					return acc;
				}, {});

				const expectedResult = DROP_TYPE_ORDER.map((dropType, index) => {
					return baseBuffFactory({
						id: `passive:19:drop boost-${dropType}`,
						value: mockValues[index],
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			DROP_TYPE_ORDER.forEach((dropTypeCase) => {
				it(`returns only value for ${dropTypeCase} if it is non-zero and other rates are zero`, () => {
					const params = DROP_TYPE_ORDER.map((dropType) => dropType === dropTypeCase ? '123' : '0').join(',');
					const expectedResult = [baseBuffFactory({
						id: `passive:19:drop boost-${dropTypeCase}`,
						value: 123,
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`returns only value for ${dropTypeCase} if it is non-zero and other rates are zero and params property does not exist`, () => {
					const effect = {
						[`${dropTypeCase} drop rate% buff`]: 123,
					};
					const expectedResult = [baseBuffFactory({
						id: `passive:19:drop boost-${dropTypeCase}`,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('defaults all effect properties to 0 for non-number values', () => {
				const effect = DROP_TYPE_ORDER.reduce((acc, dropType) => {
					acc[`${dropType} drop rate% buff`] = 'not a number';
					return acc;
				}, {});
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,0,0,0,1,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:19:drop boost-karma',
						sources: arbitrarySourceValue,
						value: 1,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 5] });
			});
		});

		describe('passive 20', () => {
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
			const expectedOriginalId = '20';

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(Object.values(AILMENT_MAPPING).concat(['unknown']).map((a) => `passive:20:chance inflict-${a}`));

			it('uses the params property when it exists', () => {
				const params = '1,2';
				const expectedResult = [baseBuffFactory({
					id: 'passive:20:chance inflict-poison',
					value: 2,
				})];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '3,4,5,6,7';
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:20:chance inflict-sick',
						value: 4,
					}),
					baseBuffFactory({
						id: 'passive:20:chance inflict-curse',
						value: 6,
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_4: '7',
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('does not return a buff entry for extra parameters when number of params is odd and last parameter is 0', () => {
				const params = '4,5,6,7,0';
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:20:chance inflict-injury',
						value: 5,
					}),
					baseBuffFactory({
						id: 'passive:20:chance inflict-paralysis',
						value: 7,
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = { 'paralysis%': 123 };
				const expectedResult = [baseBuffFactory({
					id: 'passive:20:chance inflict-paralysis',
					value: 123,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			Object.entries(AILMENT_MAPPING).forEach(([ailmentKey, ailmentName]) => {
				it(`returns an entry for ${ailmentName} when it is present in the params property`, () => {
					const params = `${ailmentKey},123`;
					const expectedResult = [baseBuffFactory({
						id: `passive:20:chance inflict-${ailmentName}`,
						value: 123,
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`returns an entry for ${ailmentName} when it is present in the effect and no params property does not exist`, () => {
					const effect = { [AILMENT_EFFECT_KEY_MAPPING[ailmentName]]: 456 };
					const expectedResult = [baseBuffFactory({
						id: `passive:20:chance inflict-${ailmentName}`,
						value: 456,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('parses multiple inflict entries in effect when params property does not exist', () => {
				const effect = Object.values(AILMENT_MAPPING).reduce((acc, ailment, index) => {
					acc[AILMENT_EFFECT_KEY_MAPPING[ailment]] = index + 1;
					return acc;
				}, {});
				const expectedResult = Object.values(AILMENT_MAPPING)
					.map((ailment, index) => baseBuffFactory({
						id: `passive:20:chance inflict-${ailment}`,
						value: index + 1,
					}));

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('parses params outside of the known ailments as unknown', () => {
				const params = '123,456';
				const expectedResult = [baseBuffFactory({
					id: 'passive:20:chance inflict-unknown',
					value: 456,
				})];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns values when no ailment is specified but chance is non-zero', () => {
				const params = '0,123';
				const expectedResult = [baseBuffFactory({
					id: 'passive:20:chance inflict-unknown',
					value: 123,
				})];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('returns a no params buff if all params are 0', () => {
				const params = new Array(8).fill('0').join(',');
				const effect = { params };
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('defaults all effect properties to 0 for non-number values', () => {
				const effect = Object.values(AILMENT_EFFECT_KEY_MAPPING).reduce((acc, ailment) => {
					acc[ailment] = 'not a number';
					return acc;
				}, {});
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '1,2,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:20:chance inflict-poison',
						sources: arbitrarySourceValue,
						value: 2,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 2] });
			});
		});

		describe('passive 21', () => {
			const STAT_PARAMS_ORDER = ['atk', 'def', 'rec', 'crit'];
			const EFFECT_KEY_MAPPING = {
				atk: 'first x turns atk% (1)',
				def: 'first x turns def% (3)',
				rec: 'first x turns rec% (5)',
				crit: 'first x turns crit% (7)',
				turnDuration: 'first x turns',
			};
			const expectedOriginalId = '21';
			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `passive:21:first turn-${stat}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:21:first turn-${stat}`,
						duration: 5,
						value: +(splitParams[index]),
					});
				});

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,6,7,8';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:21:first turn-${stat}`,
						duration: 5,
						value: +(splitParams[index]),
					});
				}).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
					value: {
						param_5: '6',
						param_6: '7',
						param_7: '8',
					},
				})]);

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to stat-specific properties when the params property does not exist', () => {
				const mockValues = [5, 6, 7, 8];
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat, index) => {
					acc[EFFECT_KEY_MAPPING[stat]] = mockValues[index];
					return acc;
				}, {});
				effect[EFFECT_KEY_MAPPING.turnDuration] = 9;

				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:21:first turn-${stat}`,
						duration: 9,
						value: mockValues[index],
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			STAT_PARAMS_ORDER.forEach((statCase) => {
				it(`returns only value for ${statCase} if it is non-zero and other stats are zero`, () => {
					const params = STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0').concat(['456']).join(',');
					const expectedResult = [baseBuffFactory({
						id: `passive:21:first turn-${statCase}`,
						value: 123,
						duration: 456,
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`returns only value for ${statCase} if it is non-zero and other stats are zero and params property does not exist`, () => {
					const effect = {
						[EFFECT_KEY_MAPPING[statCase]]: 123,
						[EFFECT_KEY_MAPPING.turnDuration]: 456,
					};
					const expectedResult = [baseBuffFactory({
						id: `passive:21:first turn-${statCase}`,
						value: 123,
						duration: 456,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('returns a no params buff if only turn duration is specified', () => {
				const params = '0,0,0,0,123';
				const effect = { params };
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('returns a no params buff if only turn duration is specified and params property does not exist', () => {
				const effect = { [EFFECT_KEY_MAPPING.turnDuration]: 123 };
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('defaults all effect properties to 0 for non-number values', () => {
				const effect = Object.values(EFFECT_KEY_MAPPING).reduce((acc, prop) => {
					acc[prop] = 'not a number';
					return acc;
				}, {});
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,0,0,1,2,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:21:first turn-crit',
						sources: arbitrarySourceValue,
						value: 1,
						duration: 2,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 5] });
			});
		});

		describe('passive 23', () => {
			const expectedBuffId = 'passive:23:bc fill on win';
			const expectedOriginalId = '23';

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = '100,200';
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						fillLow: 1,
						fillHigh: 2,
					},
					conditions: {
						onBattleWin: true,
					},
				})];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '100,200,3,4,5';
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: {
							fillLow: 1,
							fillHigh: 2,
						},
						conditions: {
							onBattleWin: true,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_2: '3',
							param_3: '4',
							param_4: '5',
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = {
					'battle end bc fill low': 3,
					'battle end bc fill high': 4,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						fillLow: 3,
						fillHigh: 4,
					},
					conditions: {
						onBattleWin: true,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = {
					'battle end bc fill low': '6',
					'battle end bc fill high': '7',
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						fillLow: 6,
						fillHigh: 7,
					},
					conditions: {
						onBattleWin: true,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are missing', () => {
				const effectPropToResultPropMapping = {
					'battle end bc fill low': 'fillLow',
					'battle end bc fill high': 'fillHigh',
				};

				Object.keys(effectPropToResultPropMapping).forEach((effectProp) => {
					it(`defaults to 0 for missing ${effectProp} value`, () => {
						const effect = Object.keys(effectPropToResultPropMapping)
							.filter((prop) => prop !== effectProp)
							.reduce((acc, prop) => {
								acc[prop] = 123;
								return acc;
							}, {});
						const expectedValues = Object.entries(effectPropToResultPropMapping)
							.reduce((acc, [localEffectProp, resultProp]) => {
								acc[resultProp] = localEffectProp === effectProp ? 0 : 123;
								return acc;
							}, {});
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							value: expectedValues,
							conditions: {
								onBattleWin: true,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				it('returns a no params buff when no parameters are given', () => {
					expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
				});

				it('defaults all effect properties to 0 for non-number values', () => {
					const effect = Object.keys(effectPropToResultPropMapping)
						.reduce((acc, prop) => {
							acc[prop] = 'not a number';
							return acc;
						}, {});
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('defaults values for effect params to 0 if they are non-number or missing', () => {
					const effect = { params: 'non-number' };
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,100,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: {
							fillLow: 0,
							fillHigh: 1,
						},
						conditions: {
							...arbitraryConditionValue,
							onBattleWin: true,
						},
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 2] });
			});
		});

		describe('passive 24', () => {
			testPassiveWithNumericalValueRangeAndChance({
				expectedOriginalId: '24',
				expectedBuffId: 'passive:24:heal on hit',
				effectKeyLow: 'dmg% to hp when attacked low',
				effectKeyHigh: 'dmg% to hp when attacked high',
				effectKeyChance: 'dmg% to hp when attacked chance%',
				buffKeyLow: 'healLow',
				buffKeyHigh: 'healHigh',
				generateBaseConditions: () => ({ whenAttacked: true }),
			});
		});

		describe('passive 25', () => {
			testPassiveWithNumericalValueRangeAndChance({
				expectedOriginalId: '25',
				expectedBuffId: 'passive:25:bc fill on hit',
				effectKeyLow: 'bc fill when attacked low',
				effectKeyHigh: 'bc fill when attacked high',
				effectKeyChance: 'bc fill when attacked%',
				buffKeyLow: 'fillLow',
				buffKeyHigh: 'fillHigh',
				getExpectedValueFromParam: (param) => +param / 100,
				generateBaseConditions: () => ({ whenAttacked: true }),
			});
		});

		describe('passive 26', () => {
			testPassiveWithNumericalValueRangeAndChance({
				expectedOriginalId: '26',
				expectedBuffId: 'passive:26:chance damage reflect',
				effectKeyLow: 'dmg% reflect low',
				effectKeyHigh: 'dmg% reflect high',
				effectKeyChance: 'dmg% reflect chance%',
				buffKeyLow: 'damageReflectLow',
				buffKeyHigh: 'damageReflectHigh',
				generateBaseConditions: () => ({ whenAttacked: true }),
			});
		});

		describe('passive 27', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '27',
				expectedBuffId: 'passive:27:target chance change',
				effectKey: 'target% chance',
			});
		});

		describe('passive 28', () => {
			const expectedOriginalId = '28';
			const expectedBuffId = 'passive:28:hp conditional target chance change';
			const hpAboveEffectKey = 'hp above % passive requirement';
			const hpBelowEffectKey = 'hp below % passive requirement';
			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = '1,2,1';
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: 1,
					conditions: {
						hpGreaterThanOrEqualTo: 2,
					},
				})];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,3,2,4,5,6';
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: 1,
						conditions: {
							hpLessThanOrEqualTo: 3,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_3: '4',
							param_4: '5',
							param_5: '6',
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when the params property does not exist', () => {
				const effect = {
					'target% chance': 4,
					[hpAboveEffectKey]: 5,
				};

				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: 4,
					conditions: {
						hpGreaterThanOrEqualTo: 5,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			[1, 2].forEach((hpThresholdCase) => {
				it(`returns value if target value is non-zero and hp threshold polarity is ${hpThresholdCase === 1 ? 'above' : 'below'}`, () => {
					const params = `123,456,${hpThresholdCase}`;
					const expectedConditions = {};
					if (hpThresholdCase === 1) {
						expectedConditions.hpGreaterThanOrEqualTo = 456;
					} else {
						expectedConditions.hpLessThanOrEqualTo = 456;
					}
					const expectedResult = [baseBuffFactory({
						id: 'passive:28:hp conditional target chance change',
						value: 123,
						conditions: expectedConditions,
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`returns value if target value is non-zero and hp threshold polarity is ${hpThresholdCase === 1 ? 'above' : 'below'} and params property does not exist`, () => {
					const effect = {
						['target% chance']: 123,
						[hpThresholdCase === 1 ? hpAboveEffectKey : hpBelowEffectKey]: 456,
					};
					const expectedConditions = {};
					if (hpThresholdCase === 1) {
						expectedConditions.hpGreaterThanOrEqualTo = 456;
					} else {
						expectedConditions.hpLessThanOrEqualTo = 456;
					}
					const expectedResult = [baseBuffFactory({
						id: 'passive:28:hp conditional target chance change',
						value: 123,
						conditions: expectedConditions,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('returns a no params buff if target value is 0', () => {
				const params = '0,2,1';
				const effect = { params };
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('defaults all parameters to 0 if they are non-number or missing', () => {
				const params = 'not a number';
				const effect = { params };
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('defaults all effect properties to 0 for non-number values', () => {
				const effect = {
					'target% chance': 'not a number',
					[hpAboveEffectKey]: 'not a number',
				};
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '1,456,1,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:28:hp conditional target chance change',
						sources: arbitrarySourceValue,
						value: 1,
						conditions: {
							...arbitraryConditionValue,
							hpGreaterThanOrEqualTo: 456,
						},
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 3] });
			});
		});

		describe('passive 29', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '29',
				expectedBuffId: 'passive:29:chance def ignore',
				effectKey: 'ignore def%',
			});
		});

		describe('passive 30', () => {
			const STAT_PARAMS_ORDER = ['atk', 'def', 'rec', 'crit'];
			const expectedOriginalId = '30';
			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `passive:30:bb gauge conditional-${stat}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,1';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:30:bb gauge conditional-${stat}`,
						value: +(splitParams[index]),
						conditions: {
							bbGaugeGreaterThanOrEqualTo: 5,
						},
					});
				});

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,2,7,8,9';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:30:bb gauge conditional-${stat}`,
						value: +(splitParams[index]),
						conditions: {
							bbGaugeLessThanOrEqualTo: 5,
						},
					});
				}).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
					value: {
						param_6: '7',
						param_7: '8',
						param_8: '9',
					},
				})]);

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to stat-specific properties when the params property does not exist', () => {
				const mockValues = [5, 6, 7, 8];
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat, index) => {
					acc[`${stat}% buff`] = mockValues[index];
					return acc;
				}, {});
				effect[BB_GAUGE_ABOVE_EFFECT_KEY] = 9;

				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:30:bb gauge conditional-${stat}`,
						value: mockValues[index],
						conditions: {
							bbGaugeGreaterThanOrEqualTo: 9,
						},
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			STAT_PARAMS_ORDER.forEach((statCase) => {
				[1, 2].forEach((hpThresholdCase) => {
					it(`returns only value for ${statCase} if it is non-zero and other stats are zero and bb gauge threshold polarity is ${hpThresholdCase === 1 ? 'above' : 'below'}`, () => {
						const params = STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0').concat(['456', hpThresholdCase]).join(',');
						const expectedConditions = {};
						if (hpThresholdCase === 1) {
							expectedConditions.bbGaugeGreaterThanOrEqualTo = 456;
						} else {
							expectedConditions.bbGaugeLessThanOrEqualTo = 456;
						}
						const expectedResult = [baseBuffFactory({
							id: `passive:30:bb gauge conditional-${statCase}`,
							value: 123,
							conditions: expectedConditions,
						})];

						const effect = { params };
						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});

					it(`returns only value for ${statCase} if it is non-zero and other stats are zero and bb gauge threshold polarity is ${hpThresholdCase === 1 ? 'above' : 'below'} and params property does not exist`, () => {
						const effect = {
							[`${statCase}% buff`]: 123,
							[hpThresholdCase === 1 ? BB_GAUGE_ABOVE_EFFECT_KEY : BB_GAUGE_BELOW_EFFECT_KEY]: 456,
						};
						const expectedConditions = {};
						if (hpThresholdCase === 1) {
							expectedConditions.bbGaugeGreaterThanOrEqualTo = 456;
						} else {
							expectedConditions.bbGaugeLessThanOrEqualTo = 456;
						}
						const expectedResult = [baseBuffFactory({
							id: `passive:30:bb gauge conditional-${statCase}`,
							value: 123,
							conditions: expectedConditions,
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('returns a no params buff if all stats are 0', () => {
				const params = '0,0,0,0,2,1';
				const effect = { params };
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('defaults all parameters to 0 if they are non-number or missing', () => {
				const params = 'not a number';
				const effect = { params };
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('defaults all effect properties to 0 for non-number stat values', () => {
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat) => {
					acc[`${stat}% buff`] = 'not a number';
					return acc;
				}, {});
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,0,0,1,456,1,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:30:bb gauge conditional-crit',
						sources: arbitrarySourceValue,
						value: 1,
						conditions: {
							...arbitraryConditionValue,
							bbGaugeGreaterThanOrEqualTo: 456,
						},
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 6] });
			});
		});

		describe('passive 31', () => {
			const expectedOriginalId = '31';
			const allParamTypes = ['damage'].concat(DROP_TYPE_ORDER);
			const effectKeyMapping = {
				damage: 'damage% for spark',
				bc: 'bc drop% for spark',
				hc: 'hc drop% for spark',
				item: 'item drop% for spark',
				zel: 'zel drop% for spark',
				karma: 'karma drop% for spark',
			};

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(allParamTypes.map((paramType) => `passive:31:spark-${paramType}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6';
				const splitParams = params.split(',');
				const expectedResult = allParamTypes.map((paramType, index) => {
					return baseBuffFactory({
						id: `passive:31:spark-${paramType}`,
						value: +(splitParams[index]),
					});
				});

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,6,7,8,9';
				const splitParams = params.split(',');
				const expectedResult = allParamTypes.map((paramType, index) => {
					return baseBuffFactory({
						id: `passive:31:spark-${paramType}`,
						value: +(splitParams[index]),
					});
				}).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
					value: {
						param_6: '7',
						param_7: '8',
						param_8: '9',
					},
				})]);

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to stat-specific properties when the params property does not exist', () => {
				const mockValues = [7, 8, 9, 10, 11, 12];
				const effect = allParamTypes.reduce((acc, paramType, index) => {
					acc[effectKeyMapping[paramType]] = mockValues[index];
					return acc;
				}, {});

				const expectedResult = allParamTypes.map((paramType, index) => {
					return baseBuffFactory({
						id: `passive:31:spark-${paramType}`,
						value: mockValues[index],
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			allParamTypes.forEach((paramTypeCase) => {
				it(`returns only value for ${paramTypeCase} if it is non-zero and other values are zero`, () => {
					const params = allParamTypes.map((paramType) => paramType === paramTypeCase ? '123' : '0').join(',');
					const expectedResult = [baseBuffFactory({
						id: `passive:31:spark-${paramTypeCase}`,
						value: 123,
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`returns only value for ${paramTypeCase} if it is non-zero and other values are zero and params property does not exist`, () => {
					const effect = {
						[effectKeyMapping[paramTypeCase]]: 123,
					};
					const expectedResult = [baseBuffFactory({
						id: `passive:31:spark-${paramTypeCase}`,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('defaults all effect properties to 0 for non-number stat values', () => {
				const effect = allParamTypes.reduce((acc, paramType) => {
					acc[effectKeyMapping[paramType]] = 'not a number';
					return acc;
				}, {});
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,0,0,0,0,1,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:31:spark-karma',
						sources: arbitrarySourceValue,
						value: 1,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 6] });
			});
		});

		describe('passive 32', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '32',
				expectedBuffId: 'passive:32:bc efficacy',
				effectKey: 'bb gauge fill rate%',
			});
		});

		describe('passive 33', () => {
			const expectedBuffId = 'passive:33:gradual heal';
			const expectedOriginalId = '33';

			const HEAL_LOW_EFFECT_KEY = 'turn heal low';
			const HEAL_HIGH_EFFECT_KEY = 'turn heal high';
			const ADDED_REC_EFFECT_KEY = 'rec% added (turn heal)';
			const ADDED_REC_BUFF_KEY = 'addedRec%';
			const arbitraryRecParam = 80;
			const expectedRecAddedForArbitraryValue = 18;

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = `1,2,${arbitraryRecParam}`;
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						healLow: 1,
						healHigh: 2,
						[ADDED_REC_BUFF_KEY]: expectedRecAddedForArbitraryValue,
					},
				})];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,${arbitraryRecParam},4,5,6`;
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: {
							healLow: 1,
							healHigh: 2,
							[ADDED_REC_BUFF_KEY]: expectedRecAddedForArbitraryValue,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_3: '4',
							param_4: '5',
							param_5: '6',
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = {
					[HEAL_LOW_EFFECT_KEY]: 4,
					[HEAL_HIGH_EFFECT_KEY]: 5,
					[ADDED_REC_EFFECT_KEY]: 6,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						healLow: 4,
						healHigh: 5,
						[ADDED_REC_BUFF_KEY]: 6,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = {
					[HEAL_LOW_EFFECT_KEY]: '7',
					[HEAL_HIGH_EFFECT_KEY]: '8',
					[ADDED_REC_EFFECT_KEY]: '9',
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						healLow: 7,
						healHigh: 8,
						[ADDED_REC_BUFF_KEY]: 9,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are missing', () => {
				const effectPropToResultPropMapping = {
					[HEAL_LOW_EFFECT_KEY]: 'healLow',
					[HEAL_HIGH_EFFECT_KEY]: 'healHigh',
					[ADDED_REC_EFFECT_KEY]: ADDED_REC_BUFF_KEY,
				};

				Object.keys(effectPropToResultPropMapping).forEach((effectProp) => {
					it(`defaults to 0 for missing ${effectProp} value`, () => {
						const effect = Object.keys(effectPropToResultPropMapping)
							.filter((prop) => prop !== effectProp)
							.reduce((acc, prop) => {
								acc[prop] = 123;
								return acc;
							}, {});
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
					expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
				});

				it('returns a no params buff when all effect properties are non-number values', () => {
					const effect = Object.keys(effectPropToResultPropMapping)
						.reduce((acc, prop) => {
							acc[prop] = 'not a number';
							return acc;
						}, {});
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('defaults values for effect params to 0 if they are non-number or missing', () => {
					const effect = { params: 'non-number' };
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: `0,1,${arbitraryRecParam},789`,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: {
							healLow: 0,
							healHigh: 1,
							[ADDED_REC_BUFF_KEY]: expectedRecAddedForArbitraryValue,
						},
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 3] });
			});
		});

		describe('passive 34', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '34',
				expectedBuffId: 'passive:34:critical damage',
				effectKey: 'crit multiplier%',
				getExpectedValueFromParam: (param) => (+param) * 100,
			});
		});

		describe('passive 35', () => {
			testPassiveWithNumericalValueRangeAndChance({
				expectedOriginalId: '35',
				expectedBuffId: 'passive:35:bc fill on normal attack',
				effectKeyLow: 'bc fill when attacking low',
				effectKeyHigh: 'bc fill when attacking high',
				effectKeyChance: 'bc fill when attacking%',
				buffKeyLow: 'fillLow',
				buffKeyHigh: 'fillHigh',
				getExpectedValueFromParam: (param) => +param / 100,
				generateBaseConditions: () => ({ onNormalAttack: true }),
			});
		});

		describe('passive 36', () => {
			const expectedBuffId = 'passive:36:extra action';
			const expectedOriginalId = '36';

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = '1,2,3';
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						additionalActions: 1,
						damageModifier: 2,
						chance: 3,
					},
				})];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,6';
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: {
							additionalActions: 1,
							damageModifier: 2,
							chance: 3,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_3: '4',
							param_4: '5',
							param_5: '6',
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = { 'additional actions': 123 };
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						additionalActions: 123,
						damageModifier: 0,
						chance: 0,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = { 'additional actions': '456' };
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						additionalActions: 456,
						damageModifier: 0,
						chance: 0,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are missing or zero', () => {
				it('returns a no params buff when no parameters are given', () => {
					expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
				});

				it('defaults values for effect params to 0 if they are non-number or missing', () => {
					const effect = { params: 'non-number' };
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('defaults effect properties to 0 for non-number values', () => {
					const effect = { 'additional actions': 'not a number' };
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '4,5,6,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: {
							additionalActions: 4,
							damageModifier: 5,
							chance: 6,
						},
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 3] });
			});
		});

		describe('passive 37', () => {
			const expectedBuffId = 'passive:37:hit count boost';
			const expectedOriginalId = '37';
			const hitIncreaseEffectKey = 'hit increase/hit';
			const extraHitDamageEffectKey = 'extra hits dmg%';

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = '1,0,2';
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						hitIncreasePerHit: 1,
						extraHitDamage: 2,
					},
				})];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,6';
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: {
							hitIncreasePerHit: 1,
							extraHitDamage: 3,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_1: '2',
							param_3: '4',
							param_4: '5',
							param_5: '6',
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = {
					[hitIncreaseEffectKey]: 3,
					[extraHitDamageEffectKey]: 4,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						hitIncreasePerHit: 3,
						extraHitDamage: 4,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = {
					[hitIncreaseEffectKey]: '5',
					[extraHitDamageEffectKey]: '6',
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						hitIncreasePerHit: 5,
						extraHitDamage: 6,
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
					it(`defaults to 0 for missing ${effectProp} value when params property does not exist`, () => {
						const effect = Object.keys(effectPropToResultPropMapping)
							.filter((prop) => prop !== effectProp)
							.reduce((acc, prop) => {
								acc[prop] = 123;
								return acc;
							}, {});
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

				it('returns a no params buff if all effect properties are non-number values', () => {
					const effect = Object.keys(effectPropToResultPropMapping)
						.reduce((acc, prop) => {
							acc[prop] = 'not a number';
							return acc;
						}, {});
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('returns a no params buff if the effect params are non-number or missing', () => {
					const effect = { params: 'non-number' };
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '1,2,3,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: {
							hitIncreasePerHit: 1,
							extraHitDamage: 3,
						},
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['0','2','0','789']), 0] });
			});
		});

		describe('passive 40', () => {
			const STAT_PARAMS_ORDER = ['atk', 'def', 'rec'];
			const CONVERTED_STAT_KEY = 'converted attribute';
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
			const expectedOriginalId = '40';
			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `passive:40:converted-${stat}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:40:converted-${stat}`,
						value: {
							convertedStat: 'atk',
							value: +(splitParams[index + 1]),
						},
					});
				});

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '2,2,3,4,5,6,7';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:40:converted-${stat}`,
						value: {
							convertedStat: 'def',
							value: +(splitParams[index + 1]),
						},
					});
				}).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
					value: {
						param_4: '5',
						param_5: '6',
						param_6: '7',
					},
				})]);

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to stat-specific properties when the params property does not exist', () => {
				const mockValues = [5, 6, 7];
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat, index) => {
					acc[`${stat}% buff`] = mockValues[index];
					return acc;
				}, {});
				effect[CONVERTED_STAT_KEY] = 'recovery';

				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:40:converted-${stat}`,
						value: {
							convertedStat: 'rec',
							value: mockValues[index],
						},
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			STAT_PARAMS_ORDER.forEach((statCase) => {
				Object.entries(paramToResultStatMapping).forEach(([convertedStatKey, convertedStatValue]) => {
					it(`returns only value for ${statCase} converted from ${convertedStatValue} if it is non-zero and other stats are zero and converted stat is ${convertedStatValue}`, () => {
						const params = [convertedStatKey, ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0')].join(',');
						const effect = { params };
						const expectedResult = [baseBuffFactory({
							id: `passive:40:converted-${statCase}`,
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
						const effect = {
							[CONVERTED_STAT_KEY]: convertedStatKey,
							[`${statCase}% buff`]: 456,
						};
						const expectedResult = [baseBuffFactory({
							id: `passive:40:converted-${statCase}`,
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
					const params = ['123', ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0')].join(',');
					const effect = { params };
					const expectedResult = [baseBuffFactory({
						id: `passive:40:converted-${statCase}`,
						value: {
							convertedStat: 'unknown',
							value: 123,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`converts converted stat values with no mapping to "unknown" and the only non-zero stat is ${statCase} and params property does not exist`, () => {
					const effect = {
						[CONVERTED_STAT_KEY]: 'arbitrary stat',
						[`${statCase}% buff`]: 456,
					};
					const expectedResult = [baseBuffFactory({
						id: `passive:40:converted-${statCase}`,
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
				const effect = { 'def% buff': 1 };
				const expectedResult = [baseBuffFactory({
					id: 'passive:40:converted-def',
					value: {
						convertedStat: 'unknown',
						value: 1,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('defaults all effect properties to 0 for non-number values', () => {
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat) => {
					acc[`${stat}% buff`] = 'not a number';
					return acc;
				}, {});
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '4,0,0,1,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:40:converted-rec',
						sources: arbitrarySourceValue,
						value: {
							convertedStat: 'hp',
							value: 1,
						},
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 4] });
			});
		});

		describe('passive 41', () => {
			const expectedOriginalId = '41';

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `passive:41:unique element count-${stat}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:41:unique element count-${stat}`,
						value: +(splitParams[index + 1]),
						conditions: {
							minimumUniqueElements: 1,
						},
					});
				});

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '5,2,3,4,5,6,7,8,9';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:41:unique element count-${stat}`,
						value: +(splitParams[index + 1]),
						conditions: {
							minimumUniqueElements: 5,
						},
					});
				}).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
					value: {
						param_6: '7',
						param_7: '8',
						param_8: '9',
					},
				})]);

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when the params property does not exist', () => {
				const mockValues = [8, 9, 10, 11, 12];
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat, index) => {
					acc[`${stat}% buff`] = mockValues[index];
					return acc;
				}, {});
				effect['unique elements required'] = 3; // types are taken at face value

				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:41:unique element count-${stat}`,
						value: mockValues[index],
						conditions: {
							minimumUniqueElements: 3,
						},
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			STAT_PARAMS_ORDER.forEach((statCase) => {
				it(`returns only value for ${statCase} if it is non-zero and other stats are zero`, () => {
					const params = [456, ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0')].join(',');
					const expectedResult = [baseBuffFactory({
						id: `passive:41:unique element count-${statCase}`,
						value: 123,
						conditions: {
							minimumUniqueElements: 456,
						},
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('defaults all effect properties to 0 for non-number values', () => {
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat) => {
					acc[`${stat}% buff`] = 'not a number';
					return acc;
				}, {});
				effect['unique elements required'] = 'not a number';
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,0,0,0,0,456,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:41:unique element count-hp',
						sources: arbitrarySourceValue,
						value: 456,
						conditions: {
							...arbitraryConditionValue,
							minimumUniqueElements: 0,
						},
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 6] });
			});
		});

		describe('passive 42', () => {
			const expectedOriginalId = '42';
			const GENDER_MAPPING = {
				0: UnitGender.Other,
				1: UnitGender.Male,
				2: UnitGender.Female,
			};

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `passive:42:gender-${stat}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:42:gender-${stat}`,
						value: +(splitParams[index + 1]),
						conditions: {
							targetGender: UnitGender.Male,
						},
					});
				});

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '2,2,3,4,5,6,7,8,9';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:42:gender-${stat}`,
						value: +(splitParams[index + 1]),
						conditions: {
							targetGender: UnitGender.Female,
						},
					});
				}).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
					value: {
						param_6: '7',
						param_7: '8',
						param_8: '9',
					},
				})]);

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when the params property does not exist', () => {
				const mockValues = [8, 9, 10, 11, 12];
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat, index) => {
					acc[`${stat}% buff`] = mockValues[index];
					return acc;
				}, {});
				effect['gender required'] = 'arbitrary gender'; // taken at face value

				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:42:gender-${stat}`,
						value: mockValues[index],
						conditions: {
							targetGender: 'arbitrary gender',
						},
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			STAT_PARAMS_ORDER.forEach((statCase) => {
				Object.entries(GENDER_MAPPING).forEach(([genderKey, genderValue]) => {
					it(`returns only value for ${statCase} and ${genderValue} if it is non-zero and other stats are zero`, () => {
						const params = [genderKey, ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0')].join(',');
						const expectedResult = [baseBuffFactory({
							id: `passive:42:gender-${statCase}`,
							value: 123,
							conditions: {
								targetGender: genderValue,
							},
						})];

						const effect = { params };
						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				it(`converts gender values with no mapping to "unknown" and the only non-zero stat is ${statCase}`, () => {
					const params = ['123', ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0')].join(',');
					const expectedResult = [baseBuffFactory({
						id: `passive:42:gender-${statCase}`,
						value: 123,
						conditions: {
							targetGender: 'unknown',
						},
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`outputs stat buffs when no genders are specified and the only non-zero stat is ${statCase}`, () => {
					const params = ['', ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0')].join(',');
					const expectedResult = [baseBuffFactory({
						id: `passive:42:gender-${statCase}`,
						value: 123,
						conditions: {
							targetGender: 'unknown',
						},
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('outputs stat buffs when no genders are given', () => {
				const params = ['', ...STAT_PARAMS_ORDER.map((stat, index) => index + 1)].join(',');

				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:42:gender-${stat}`,
						value: index + 1,
						conditions: {
							targetGender: 'unknown',
						},
					});
				});

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('defaults all effect properties to 0 for non-number values', () => {
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat) => {
					acc[`${stat}% buff`] = 'not a number';
					return acc;
				}, {});
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,0,0,0,0,456,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:42:gender-hp',
						sources: arbitrarySourceValue,
						value: 456,
						conditions: {
							...arbitraryConditionValue,
							targetGender: UnitGender.Other,
						},
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 6] });
			});
		});

		describe('passive 43', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '43',
				expectedBuffId: 'passive:43:chance damage to one',
				effectKey: 'take 1 dmg%',
			});
		});

		describe('passive 44', () => {
			const expectedOriginalId = '44';
			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `passive:44:flat-${stat}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:44:flat-${stat}`,
						value: +(splitParams[index]),
					});
				});

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,6,7,8';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:44:flat-${stat}`,
						value: +(splitParams[index]),
					});
				}).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
					value: {
						param_5: '6',
						param_6: '7',
						param_7: '8',
					},
				})]);

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to stat-specific properties when the params property does not exist', () => {
				const mockValues = [6, 7, 8, 9, 10];
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat, index) => {
					acc[`${stat} buff`] = mockValues[index];
					return acc;
				}, {});

				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:44:flat-${stat}`,
						value: mockValues[index],
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			STAT_PARAMS_ORDER.forEach((statCase) => {
				it(`returns only value for ${statCase} if it is non-zero and other stats are zero`, () => {
					const params = STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0').join(',');
					const expectedResult = [baseBuffFactory({
						id: `passive:44:flat-${statCase}`,
						value: 123,
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`returns only value for ${statCase} if it is non-zero and other stats are zero and params property does not exist`, () => {
					const effect = { [`${statCase} buff`]: 123 };
					const expectedResult = [baseBuffFactory({
						id: `passive:44:flat-${statCase}`,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('defaults all effect properties to 0 for non-number values', () => {
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat) => {
					acc[`${stat} buff`] = 'not a number';
					return acc;
				}, {});
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,0,0,0,456,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:44:flat-hp',
						sources: arbitrarySourceValue,
						value: 456,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 5] });
			});
		});

		describe('passive 45', () => {
			const expectedBuffIdForBase = 'passive:45:critical damage reduction-base';
			const expectedBuffIdForBuff = 'passive:45:critical damage reduction-buff';
			const BASE_EFFECT_KEY = 'base crit% resist';
			const BUFF_EFFECT_KEY = 'buff crit% resist';
			const expectedOriginalId = '45';

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffIdForBase, expectedBuffIdForBuff]);

			it('uses the params property when it exists', () => {
				const params = '1,2';
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForBase,
						value: 1,
					}),
					baseBuffFactory({
						id: expectedBuffIdForBuff,
						value: 2,
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5';
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForBase,
						value: 1,
					}),
					baseBuffFactory({
						id: expectedBuffIdForBuff,
						value: 2,
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_2: '3',
							param_3: '4',
							param_4: '5',
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});


			it('falls back to effect properties when the params property does not exist', () => {
				const effect = {
					[BASE_EFFECT_KEY]: 3,
					[BUFF_EFFECT_KEY]: 4,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForBase,
						value: 3,
					}),
					baseBuffFactory({
						id: expectedBuffIdForBuff,
						value: 4,
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('parses effect properties to number when the params property does not exist', () => {
				const effect = {
					[BASE_EFFECT_KEY]: '5',
					[BUFF_EFFECT_KEY]: '6',
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForBase,
						value: 5,
					}),
					baseBuffFactory({
						id: expectedBuffIdForBuff,
						value: 6,
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('for missing or 0 values', () => {
				it('returns only value for base if it is non-zero and buff is 0', () => {
					const effect = { params: '123,0' };

					const expectedResult = [baseBuffFactory({
						id: expectedBuffIdForBase,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns only value for buff if it is non-zero and base is 0', () => {
					const effect = { params: '0,123' };

					const expectedResult = [baseBuffFactory({
						id: expectedBuffIdForBuff,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns only value for base if it is non-zero and buff is 0 and params property does not exist', () => {
					const effect = { [BASE_EFFECT_KEY]: 456 };

					const expectedResult = [baseBuffFactory({
						id: expectedBuffIdForBase,
						value: 456,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns only value for buff if it is non-zero and base is 0 and params property does not exist', () => {
					const effect = { [BUFF_EFFECT_KEY]: 456 };

					const expectedResult = [baseBuffFactory({
						id: expectedBuffIdForBuff,
						value: 456,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a no params buff when no parameters are given', () => {
					expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
				});

				it('defaults all params properties to 0 for non-number values', () => {
					const effect = { params: 'not a number' };
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('defaults all effect properties to 0 for non-number values and params property does not exist', () => {
					const effect = {
						[BASE_EFFECT_KEY]: 'not a number',
						[BUFF_EFFECT_KEY]: 'not a number',
					};
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '1,0,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForBase,
						sources: arbitrarySourceValue,
						value: 1,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 2] });
			});
		});

		describe('passive 46', () => {
			const STAT_PARAMS_ORDER = ['atk', 'def', 'rec'];
			const PROPORTIONAL_TO_HP_EFFECT_KEY = 'buff proportional to hp';
			const expectedOriginalId = '46';
			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `passive:46:hp scaled-${stat}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6,7';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:46:hp scaled-${stat}`,
						value: {
							baseValue: +(splitParams[index * 2]),
							addedValue: +(splitParams[(index * 2) + 1]),
							proportionalMode: 'remaining',
						},
					});
				});

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,6,1,8,9,10';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:46:hp scaled-${stat}`,
						value: {
							baseValue: +(splitParams[index * 2]),
							addedValue: +(splitParams[(index * 2) + 1]),
							proportionalMode: 'lost',
						},
					});
				}).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
					value: {
						param_7: '8',
						param_8: '9',
						param_9: '10',
					},
				})]);

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to stat-specific properties when the params property does not exist', () => {
				const mockValues = [8, 9, 10, 11, 12, 13];
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat, index) => {
					acc[`${stat}% base buff`] = mockValues[index * 2];
					acc[`${stat}% extra buff based on hp`] = mockValues[(index * 2) + 1];
					return acc;
				}, {});
				effect[PROPORTIONAL_TO_HP_EFFECT_KEY] = 'arbitrary proportional value'; // taken at face value

				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:46:hp scaled-${stat}`,
						value: {
							baseValue: +(mockValues[index * 2]),
							addedValue: +(mockValues[(index * 2) + 1]),
							proportionalMode: 'arbitrary proportional value',
						},
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls parses stat-specific properties to numbers when the params property does not exist', () => {
				const mockValues = [15, 16, 17, 18, 19, 20];
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat, index) => {
					acc[`${stat}% base buff`] = `${mockValues[index * 2]}`;
					acc[`${stat}% extra buff based on hp`] =`${ mockValues[(index * 2) + 1]}`;
					return acc;
				}, {});
				effect[PROPORTIONAL_TO_HP_EFFECT_KEY] = 'arbitrary proportional value'; // taken at face value

				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:46:hp scaled-${stat}`,
						value: {
							baseValue: +(mockValues[index * 2]),
							addedValue: +(mockValues[(index * 2) + 1]),
							proportionalMode: 'arbitrary proportional value',
						},
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			STAT_PARAMS_ORDER.forEach((statCase) => {
				[true, false].forEach((testCaseIsForBaseValue) => {
					it(`returns only value for ${statCase} if it's ${testCaseIsForBaseValue ? 'base' : 'added'} value non-zero and other stats are zero`, () => {
						const nonZeroParams = testCaseIsForBaseValue ? '123,0' : '0,123';
						const params = [...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? nonZeroParams : '0,0'), '0'].join(',');
						const expectedResult = [baseBuffFactory({
							id: `passive:46:hp scaled-${statCase}`,
							value: {
								baseValue: testCaseIsForBaseValue ? 123 : 0,
								addedValue: testCaseIsForBaseValue ? 0 : 123,
								proportionalMode: 'remaining',
							},
						})];

						const effect = { params };
						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});

					it(`returns only value for ${statCase} if it's ${testCaseIsForBaseValue ? 'base' : 'added'} value non-zero and other stats are zero when params property does not exist`, () => {
						const effectKey = testCaseIsForBaseValue ? `${statCase}% base buff` : `${statCase}% extra buff based on hp`;
						const effect = { [effectKey]: 123 };
						effect[PROPORTIONAL_TO_HP_EFFECT_KEY] = 'arbitrary proportional value';
						const expectedResult = [baseBuffFactory({
							id: `passive:46:hp scaled-${statCase}`,
							value: {
								baseValue: testCaseIsForBaseValue ? 123 : 0,
								addedValue: testCaseIsForBaseValue ? 0 : 123,
								proportionalMode: 'arbitrary proportional value',
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});
			});

			it('returns buffs with proportional mode set to unknown when proportional hp property is missing from effect and params property does not exist', () => {
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat) => {
					acc[`${stat}% base buff`] = 1;
					acc[`${stat}% extra buff based on hp`] = 2;
					return acc;
				}, {});

				const expectedResult = STAT_PARAMS_ORDER.map((stat) => {
					return baseBuffFactory({
						id: `passive:46:hp scaled-${stat}`,
						value: {
							baseValue: 1,
							addedValue: 2,
							proportionalMode: 'unknown',
						},
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('defaults all effect properties to 0 for non-number values', () => {
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat) => {
					acc[`${stat}% base buff`] = 'not a number';
					acc[`${stat}% extra buff based on hp`] = 'not a number';
					return acc;
				}, {});
				effect[PROPORTIONAL_TO_HP_EFFECT_KEY] = 'arbitrary value';
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,0,0,0,0,1,0,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:46:hp scaled-rec',
						sources: arbitrarySourceValue,
						value: {
							baseValue: 0,
							addedValue: 1,
							proportionalMode: 'remaining',
						},
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 7] });
			});
		});

		describe('passive 47', () => {
			testPassiveWithNumericalValueRangeAndChance({
				expectedOriginalId: '47',
				expectedBuffId: 'passive:47:bc fill on spark',
				effectKeyLow: 'bc fill on spark low',
				effectKeyHigh: 'bc fill on spark high',
				effectKeyChance: 'bc fill on spark%',
				buffKeyLow: 'fillLow',
				buffKeyHigh: 'fillHigh',
				getExpectedValueFromParam: (param) => +param / 100,
			});
		});

		describe('passive 48', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '48',
				expectedBuffId: 'passive:48:bc cost reduction',
				effectKey: 'reduced bb bc cost%',
			});
		});

		describe('passive 49', () => {
			testPassiveWithNumericalValueRangeAndChance({
				expectedOriginalId: '49',
				expectedBuffId: 'passive:49:bb gauge consumption reduction',
				effectKeyLow: 'reduced bb bc use% low',
				effectKeyHigh: 'reduced bb bc use% high',
				effectKeyChance: 'reduced bb bc use chance%',
				buffKeyLow: 'reducedUseLow%',
				buffKeyHigh: 'reducedUseHigh%',
			});
		});

		describe('passive 50', () => {
			const expectedOriginalId = '50';
			const ELEMENT_MAPPING = {
				1: UnitElement.Fire,
				2: UnitElement.Water,
				3: UnitElement.Earth,
				4: UnitElement.Thunder,
				5: UnitElement.Light,
				6: UnitElement.Dark,
			};

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(Object.values(ELEMENT_MAPPING).concat(['unknown']).map((elem) => `passive:50:elemental weakness damage-${elem}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6,7';
				const expectedResult = Object.values(ELEMENT_MAPPING).map((element) => {
					return baseBuffFactory({
						id: `passive:50:elemental weakness damage-${element}`,
						value: 700,
					});
				});

				const effect = { params };
				const context = createArbitraryContext();
				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,6,7,8,9,10';
				const expectedResult = Object.values(ELEMENT_MAPPING).map((element) => {
					return baseBuffFactory({
						id: `passive:50:elemental weakness damage-${element}`,
						value: 700,
					});
				}).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
					value: {
						param_7: '8',
						param_8: '9',
						param_9: '10',
					},
				})]);

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to stat-specific properties when the params property does not exist', () => {
				const elements = Object.values(ELEMENT_MAPPING);
				const effect = elements.reduce((acc, element) => {
					acc[`${element} units do extra elemental weakness dmg`] = true;
					return acc;
				}, {});
				effect['elemental weakness multiplier%'] = 14;
				const expectedResult = elements.map((element) => {
					return baseBuffFactory({
						id: `passive:50:elemental weakness damage-${element}`,
						value: 14,
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			Object.entries(ELEMENT_MAPPING).forEach(([knownElementKey, knownElementValue]) => {
				it(`parses raw value for ${knownElementValue} in params property`, () => {
					const params = `${knownElementKey},0,0,0,0,0,123`;
					const expectedResult = [baseBuffFactory({
						id: `passive:50:elemental weakness damage-${knownElementValue}`,
						value: 12300,
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`parses value for ${knownElementValue} when its effect property is true and not given params property`, () => {
					const effect = {
						[`${knownElementValue} units do extra elemental weakness dmg`]: true,
						'elemental weakness multiplier%': 456,
					};
					const expectedResult = [baseBuffFactory({
						id: `passive:50:elemental weakness damage-${knownElementValue}`,
						value: 456,
					})];

					const context = createArbitraryContext();
					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});

				it(`returns an unknown element buff for ${knownElementValue} when its effect property is false and not given params property`, () => {
					const effect = {
						[`${knownElementValue} units do extra elemental weakness dmg`]: false,
						'elemental weakness multiplier%': 456,
					};
					const expectedResult = [baseBuffFactory({
						id: 'passive:50:elemental weakness damage-unknown',
						value: 456,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('defaults to unknown element if corresponding element value cannot be found from parsed params', () => {
				const params = 'not-an-element,0,0,0,0,0,789';
				const expectedResult = [baseBuffFactory({
					id: 'passive:50:elemental weakness damage-unknown',
					value: 78900,
				})];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff if parsed damage value from params is zero', () => {
				const params = '1,2,3,4,5,6,0';
				const effect = { params };
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '5,0,0,0,0,0,6,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:50:elemental weakness damage-light',
						sources: arbitrarySourceValue,
						value: 600,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 7] });
			});
		});

		describe('passive 53', () => {
			const BUFF_ID_MAPPING = {
				criticalDamageBase: 'passive:53:critical damage-base',
				criticalDamageBuff: 'passive:53:critical damage-buff',
				elementDamageBase: 'passive:53:element damage-base',
				elementDamageBuff: 'passive:53:element damage-buff',
				criticalRateBase: 'passive:53:critical rate-base',
				criticalRateBuff: 'passive:53:critical rate-buff',
			};
			const EFFECT_KEY_MAPPING = {
				criticalDamageBase: 'crit dmg base damage resist%',
				criticalDamageBuff: 'crit dmg buffed damage resist%',
				elementDamageBase: 'strong base element damage resist%',
				elementDamageBuff: 'strong buffed element damage resist%',
				criticalRateBase: 'crit chance base resist%',
				criticalRateBuff: 'crit chance buffed resist%',
			};
			const PARAMS_ORDER = ['criticalDamageBase', 'criticalDamageBuff', 'elementDamageBase', 'elementDamageBuff', 'criticalRateBase', 'criticalRateBuff'];
			const expectedOriginalId = '53';

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(PARAMS_ORDER.map((k) => BUFF_ID_MAPPING[k]));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6';
				const expectedResult = [
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalDamageBase,
						value: 1,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalDamageBuff,
						value: 2,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.elementDamageBase,
						value: 3,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.elementDamageBuff,
						value: 4,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalRateBase,
						value: 5,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalRateBuff,
						value: 6,
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,6,7,8,9';
				const expectedResult = [
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalDamageBase,
						value: 1,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalDamageBuff,
						value: 2,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.elementDamageBase,
						value: 3,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.elementDamageBuff,
						value: 4,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalRateBase,
						value: 5,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalRateBuff,
						value: 6,
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_6: '7',
							param_7: '8',
							param_8: '9',
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when the params property does not exist', () => {
				const effect = {
					[EFFECT_KEY_MAPPING.criticalDamageBase]: 7,
					[EFFECT_KEY_MAPPING.criticalDamageBuff]: 8,
					[EFFECT_KEY_MAPPING.elementDamageBase]: 9,
					[EFFECT_KEY_MAPPING.elementDamageBuff]: 10,
					[EFFECT_KEY_MAPPING.criticalRateBase]: 11,
					[EFFECT_KEY_MAPPING.criticalRateBuff]: 12,
				};
				const expectedResult = [
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalDamageBase,
						value: 7,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalDamageBuff,
						value: 8,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.elementDamageBase,
						value: 9,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.elementDamageBuff,
						value: 10,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalRateBase,
						value: 11,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalRateBuff,
						value: 12,
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('parses effect properties to number when the params property does not exist', () => {
				const effect = {
					[EFFECT_KEY_MAPPING.criticalDamageBase]: '7',
					[EFFECT_KEY_MAPPING.criticalDamageBuff]: '8',
					[EFFECT_KEY_MAPPING.elementDamageBase]: '9',
					[EFFECT_KEY_MAPPING.elementDamageBuff]: '10',
					[EFFECT_KEY_MAPPING.criticalRateBase]: '11',
					[EFFECT_KEY_MAPPING.criticalRateBuff]: '12',
				};
				const expectedResult = [
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalDamageBase,
						value: 7,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalDamageBuff,
						value: 8,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.elementDamageBase,
						value: 9,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.elementDamageBuff,
						value: 10,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalRateBase,
						value: 11,
					}),
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalRateBuff,
						value: 12,
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('for missing or 0 values', () => {
				PARAMS_ORDER.forEach((key, index) => {
					it(`returns a single buff for ${BUFF_ID_MAPPING[key]} if it's the only parameter that is non-zero`, () => {
						const params = Array.from({ length: PARAMS_ORDER.length }).fill(0).map((_, i) => i !== index ? '0' : '123').join(',');
						const expectedResult = [baseBuffFactory({
							id: BUFF_ID_MAPPING[key],
							value: 123,
						})];

						const effect = { params };
						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});

					it(`returns a single buff for ${BUFF_ID_MAPPING[key]} if it's the only parameter that is non-zero and the params property does not exist`, () => {
						const effect = { [EFFECT_KEY_MAPPING[key]]: 456 };
						const expectedResult = [baseBuffFactory({
							id: BUFF_ID_MAPPING[key],
							value: 456,
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				it('returns a no params buff when no parameters are given', () => {
					expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
				});

				it('defaults all params properties to 0 for non-number values', () => {
					const effect = { params: 'not a number' };
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('defaults all effect properties to 0 for non-number values and params property does not exist', () => {
					const effect = {
						[EFFECT_KEY_MAPPING.criticalDamageBase]: 'not a number',
						[EFFECT_KEY_MAPPING.criticalDamageBuff]: 'not a number',
						[EFFECT_KEY_MAPPING.elementDamageBase]: 'not a number',
						[EFFECT_KEY_MAPPING.elementDamageBuff]: 'not a number',
						[EFFECT_KEY_MAPPING.criticalRateBase]: 'not a number',
						[EFFECT_KEY_MAPPING.criticalRateBuff]: 'not a number',
					};
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '1,0,0,0,0,0,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: BUFF_ID_MAPPING.criticalDamageBase,
						sources: arbitrarySourceValue,
						value: 1,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 6] });
			});
		});

		describe('passive 55', () => {
			const expectedBuffId = 'passive:55:hp conditional';
			const expectedOriginalId = '55';

			const arbitraryKnownConditionalId = 'arbitrary conditional id for passive 55';
			const getArbitraryBuffsForConditionalEffect = () => [{ arbitrary: 'conditional buff' }];
			let mockConditionalEffectConversionFunctionSpy;
			let injectionContext;

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);

				mockConditionalEffectConversionFunctionSpy = jasmine.createSpy('mockConditionalEffectConversionFunctionSpy');
				mockConditionalEffectConversionFunctionSpy.and.callFake(() => getArbitraryBuffsForConditionalEffect());
				injectionContext = { convertConditionalEffectToBuffs: mockConditionalEffectConversionFunctionSpy };
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = `${arbitraryKnownConditionalId},2,3,4,1,6`;
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						triggeredBuffs: getArbitraryBuffsForConditionalEffect(),
						maxTriggerCount: 3,
					},
					conditions: {
						hpGreaterThanOrEqualTo: 4,
					},
				})];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext(), injectionContext);
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `${arbitraryKnownConditionalId},2,3,4,2,6,7,8,9`;
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: {
							triggeredBuffs: getArbitraryBuffsForConditionalEffect(),
							maxTriggerCount: 3,
						},
						conditions: {
							hpLessThanOrEqualTo: 4,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_6: '7',
							param_7: '8',
							param_8: '9',
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext(), injectionContext);
				expect(result).toEqual(expectedResult);
			});

			[1, 2].forEach((hpThresholdCase) => {
				const shouldBeAbove = hpThresholdCase === 1;
				it(`correctly parses hp threshold and and polarity when the polarity parameter is ${shouldBeAbove ? 'above' : 'below'}`, () => {
					const params = `${arbitraryKnownConditionalId},2,3,123,${hpThresholdCase},6`;
					const expectedConditions = {};
					if (shouldBeAbove) {
						expectedConditions.hpGreaterThanOrEqualTo = 123;
					} else {
						expectedConditions.hpLessThanOrEqualTo = 123;
					}
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							triggeredBuffs: getArbitraryBuffsForConditionalEffect(),
							maxTriggerCount: 3,
						},
						conditions: expectedConditions,
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext(), injectionContext);
					expect(result).toEqual(expectedResult);
				});
			});

			it('calls corresponding conditional effect conversion function defined in injection context', () => {
				const params = `${arbitraryKnownConditionalId},2&3&4,3,4,1,6`;
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						triggeredBuffs: getArbitraryBuffsForConditionalEffect(),
						maxTriggerCount: 3,
					},
					conditions: {
						hpGreaterThanOrEqualTo: 4,
					},
				})];

				const effect = { params };
				const context = createArbitraryContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expect(mockConditionalEffectConversionFunctionSpy).toHaveBeenCalledWith({
					id: arbitraryKnownConditionalId,
					params: '2&3&4',
					turnDuration: 6,
				}, context);
			});

			it('calls corresponding conditional effect conversion function when not defined via injection context', () => {
				const params = `${arbitraryKnownConditionalId},2&3&4,3,4,1,6`;
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						triggeredBuffs: getArbitraryBuffsForConditionalEffect(),
						maxTriggerCount: 3,
					},
					conditions: {
						hpGreaterThanOrEqualTo: 4,
					},
				})];

				getConditionalEffectToBuffMapping(true).set(arbitraryKnownConditionalId, mockConditionalEffectConversionFunctionSpy);

				const effect = { params };
				const context = createArbitraryContext();
				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
				expect(mockConditionalEffectConversionFunctionSpy).toHaveBeenCalledWith({
					id: arbitraryKnownConditionalId,
					params: '2&3&4',
					turnDuration: 6,
				}, context);
			});

			it('defaults numerical values to 0 if they are missing or non-number', () => {
				const params = `${arbitraryKnownConditionalId},params,not a number,not a number,1`;
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						triggeredBuffs: getArbitraryBuffsForConditionalEffect(),
						maxTriggerCount: 0,
					},
					conditions: {
						hpGreaterThanOrEqualTo: 0,
					},
				})];

				const effect = { params };
				const context = createArbitraryContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expect(mockConditionalEffectConversionFunctionSpy).toHaveBeenCalledWith({
					id: arbitraryKnownConditionalId,
					params: 'params',
					turnDuration: 0,
				}, context);
			});

			it('returns a no params buff when no parameters are given', () => {
				mockConditionalEffectConversionFunctionSpy.and.returnValue([]);
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext(), injectionContext });
			});

			it('returns a no params buff if no triggered buffs are found', () => {
				const params = `${arbitraryKnownConditionalId},2,3,4,1,6`;
				mockConditionalEffectConversionFunctionSpy.and.returnValue([]);
				expectNoParamsBuffWithEffectAndContext({ effect: { params }, context: createArbitraryContext(), injectionContext });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: `${arbitraryKnownConditionalId},2,3,456,1,6,789`,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: {
							triggeredBuffs: getArbitraryBuffsForConditionalEffect(),
							maxTriggerCount: 3,
						},
						conditions: {
							...arbitraryConditionValue,
							hpGreaterThanOrEqualTo: 456,
						},
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				injectionContext ={ ...injectionContext, ...createDefaultInjectionContext() };
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 6] });
			});
		});

		describe('passive 58', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '58',
				expectedBuffId: 'passive:58:guard mitigation',
				effectKey: 'guard increase mitigation%',
			});
		});

		describe('passive 59', () => {
			const expectedBuffIdForPercent = 'passive:59:bc fill when attacked on guard-percent';
			const expectedBuffIdForFlat = 'passive:59:bc fill when attacked on guard-flat';
			const expectedOriginalId = '59';

			const PERCENT_FILL_EFFECT_KEY = 'bb gauge% filled when attacked while guarded';
			const FLAT_FILL_EFFECT_KEY = 'bc filled when attacked while guarded';

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffIdForPercent, expectedBuffIdForFlat]);

			it('uses the params property when it exists', () => {
				const params = '1,200';
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForPercent,
						value: 1,
						conditions: {
							whenAttacked: true,
							onGuard: true,
						},
					}),
					baseBuffFactory({
						id: expectedBuffIdForFlat,
						value: 2,
						conditions: {
							whenAttacked: true,
							onGuard: true,
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,200,3,4,5';
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForPercent,
						value: 1,
						conditions: {
							whenAttacked: true,
							onGuard: true,
						},
					}),
					baseBuffFactory({
						id: expectedBuffIdForFlat,
						value: 2,
						conditions: {
							whenAttacked: true,
							onGuard: true,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_2: '3',
							param_3: '4',
							param_4: '5',
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = {
					[PERCENT_FILL_EFFECT_KEY]: 3,
					[FLAT_FILL_EFFECT_KEY]: 4,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForPercent,
						value: 3,
						conditions: {
							whenAttacked: true,
							onGuard: true,
						},
					}),
					baseBuffFactory({
						id: expectedBuffIdForFlat,
						value: 4,
						conditions: {
							whenAttacked: true,
							onGuard: true,
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = {
					[PERCENT_FILL_EFFECT_KEY]: '5',
					[FLAT_FILL_EFFECT_KEY]: '6',
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForPercent,
						value: 5,
						conditions: {
							whenAttacked: true,
							onGuard: true,
						},
					}),
					baseBuffFactory({
						id: expectedBuffIdForFlat,
						value: 6,
						conditions: {
							whenAttacked: true,
							onGuard: true,
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are missing', () => {
				it('returns a single buff for percent fill if it is the only non-zero parameter', () => {
					const params = '123,0';
					const effect = { params };
					const expectedResult = [baseBuffFactory({
						id: expectedBuffIdForPercent,
						value: 123,
						conditions: {
							whenAttacked: true,
							onGuard: true,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a single buff for flat fill if it is the only non-zero parameter', () => {
					const params = '0,12300';
					const effect = { params };
					const expectedResult = [baseBuffFactory({
						id: expectedBuffIdForFlat,
						value: 123,
						conditions: {
							whenAttacked: true,
							onGuard: true,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a single buff for percent fill if it is the only non-zero parameter and the params property does not exist', () => {
					const effect = { [PERCENT_FILL_EFFECT_KEY]: 456 };
					const expectedResult = [baseBuffFactory({
						id: expectedBuffIdForPercent,
						value: 456,
						conditions: {
							whenAttacked: true,
							onGuard: true,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a single buff for flat fill if it is the only non-zero parameter and the params property does not exist', () => {
					const effect = { [FLAT_FILL_EFFECT_KEY]: 456 };
					const expectedResult = [baseBuffFactory({
						id: expectedBuffIdForFlat,
						value: 456,
						conditions: {
							whenAttacked: true,
							onGuard: true,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a no params buff when no parameters are given', () => {
					expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
				});

				it('defaults all effect properties to 0 for non-number values', () => {
					const effect = {
						[PERCENT_FILL_EFFECT_KEY]: 'not a number',
						[FLAT_FILL_EFFECT_KEY]: 'not a number',
					};
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('defaults values for effect params to 0 if they are non-number or missing', () => {
					const effect = { params: 'non-number' };
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,100,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForFlat,
						sources: arbitrarySourceValue,
						value: 1,
						conditions: {
							...arbitraryConditionValue,
							whenAttacked: true,
							onGuard: true,
						},
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 2] });
			});
		});

		describe('passive 61', () => {
			const expectedBuffIdForPercent = 'passive:61:bc fill on guard-percent';
			const expectedBuffIdForFlat = 'passive:61:bc fill on guard-flat';
			const expectedOriginalId = '61';

			const PERCENT_FILL_EFFECT_KEY = 'bb gauge% filled on guard';
			const FLAT_FILL_EFFECT_KEY = 'bc filled on guard';

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffIdForPercent, expectedBuffIdForFlat]);

			it('uses the params property when it exists', () => {
				const params = '1,200';
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForPercent,
						value: 1,
						conditions: {
							onGuard: true,
						},
					}),
					baseBuffFactory({
						id: expectedBuffIdForFlat,
						value: 2,
						conditions: {
							onGuard: true,
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,200,3,4,5';
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForPercent,
						value: 1,
						conditions: {
							onGuard: true,
						},
					}),
					baseBuffFactory({
						id: expectedBuffIdForFlat,
						value: 2,
						conditions: {
							onGuard: true,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_2: '3',
							param_3: '4',
							param_4: '5',
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = {
					[PERCENT_FILL_EFFECT_KEY]: 3,
					[FLAT_FILL_EFFECT_KEY]: 4,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForPercent,
						value: 3,
						conditions: {
							onGuard: true,
						},
					}),
					baseBuffFactory({
						id: expectedBuffIdForFlat,
						value: 4,
						conditions: {
							onGuard: true,
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = {
					[PERCENT_FILL_EFFECT_KEY]: '5',
					[FLAT_FILL_EFFECT_KEY]: '6',
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForPercent,
						value: 5,
						conditions: {
							onGuard: true,
						},
					}),
					baseBuffFactory({
						id: expectedBuffIdForFlat,
						value: 6,
						conditions: {
							onGuard: true,
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are missing', () => {
				it('returns a single buff for percent fill if it is the only non-zero parameter', () => {
					const params = '123,0';
					const effect = { params };
					const expectedResult = [baseBuffFactory({
						id: expectedBuffIdForPercent,
						value: 123,
						conditions: {
							onGuard: true,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a single buff for flat fill if it is the only non-zero parameter', () => {
					const params = '0,12300';
					const effect = { params };
					const expectedResult = [baseBuffFactory({
						id: expectedBuffIdForFlat,
						value: 123,
						conditions: {
							onGuard: true,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a single buff for percent fill if it is the only non-zero parameter and the params property does not exist', () => {
					const effect = { [PERCENT_FILL_EFFECT_KEY]: 456 };
					const expectedResult = [baseBuffFactory({
						id: expectedBuffIdForPercent,
						value: 456,
						conditions: {
							onGuard: true,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a single buff for flat fill if it is the only non-zero parameter and the params property does not exist', () => {
					const effect = { [FLAT_FILL_EFFECT_KEY]: 456 };
					const expectedResult = [baseBuffFactory({
						id: expectedBuffIdForFlat,
						value: 456,
						conditions: {
							onGuard: true,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a no params buff when no parameters are given', () => {
					expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
				});

				it('defaults all effect properties to 0 for non-number values', () => {
					const effect = {
						[PERCENT_FILL_EFFECT_KEY]: 'not a number',
						[FLAT_FILL_EFFECT_KEY]: 'not a number',
					};
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('defaults values for effect params to 0 if they are non-number or missing', () => {
					const effect = { params: 'non-number' };
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,100,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForFlat,
						sources: arbitrarySourceValue,
						value: 1,
						conditions: {
							...arbitraryConditionValue,
							onGuard: true,
						},
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 2] });
			});
		});

		describe('passive 62', () => {
			const expectedOriginalId = '62';
			const ELEMENT_MAPPING = {
				1: UnitElement.Fire,
				2: UnitElement.Water,
				3: UnitElement.Earth,
				4: UnitElement.Thunder,
				5: UnitElement.Light,
				6: UnitElement.Dark,
			};

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(Object.values(ELEMENT_MAPPING).concat(['unknown']).map((elem) => `passive:62:mitigate-${elem}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6,7';
				const expectedResult = Object.values(ELEMENT_MAPPING).map((element) => {
					return baseBuffFactory({
						id: `passive:62:mitigate-${element}`,
						value: 7,
					});
				});

				const effect = { params };
				const context = createArbitraryContext();
				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,6,7,8,9,10';
				const expectedResult = Object.values(ELEMENT_MAPPING).map((element) => {
					return baseBuffFactory({
						id: `passive:62:mitigate-${element}`,
						value: 7,
					});
				}).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
					value: {
						param_7: '8',
						param_8: '9',
						param_9: '10',
					},
				})]);

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to stat-specific properties when the params property does not exist', () => {
				const elements = Object.values(ELEMENT_MAPPING);
				const effect = elements.reduce((acc, element) => {
					acc[`mitigate ${element} attacks`] = true;
					return acc;
				}, {});
				effect['dmg% mitigation for elemental attacks'] = 14;
				const expectedResult = elements.map((element) => {
					return baseBuffFactory({
						id: `passive:62:mitigate-${element}`,
						value: 14,
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			Object.entries(ELEMENT_MAPPING).forEach(([knownElementKey, knownElementValue]) => {
				it(`parses raw value for ${knownElementValue} in params property`, () => {
					const params = `${knownElementKey},0,0,0,0,0,123`;
					const expectedResult = [baseBuffFactory({
						id: `passive:62:mitigate-${knownElementValue}`,
						value: 123,
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`parses value for ${knownElementValue} when its effect property is true and not given params property`, () => {
					const effect = {
						[`mitigate ${knownElementValue} attacks`]: true,
						'dmg% mitigation for elemental attacks': 456,
					};
					const expectedResult = [baseBuffFactory({
						id: `passive:62:mitigate-${knownElementValue}`,
						value: 456,
					})];

					const context = createArbitraryContext();
					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});

				it(`returns an unknown element buff for ${knownElementValue} when its effect property is false and not given params property`, () => {
					const effect = {
						[`mitigate ${knownElementValue} attacks`]: false,
						'dmg% mitigation for elemental attacks': 456,
					};
					const expectedResult = [baseBuffFactory({
						id: 'passive:62:mitigate-unknown',
						value: 456,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('defaults to unknown element if corresponding element value cannot be found from parsed params', () => {
				const params = 'not-an-element,0,0,0,0,0,789';
				const expectedResult = [baseBuffFactory({
					id: 'passive:62:mitigate-unknown',
					value: 789,
				})];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff if parsed mitigation value from params is zero', () => {
				const params = '1,2,3,4,5,6,0';
				const effect = { params };
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '5,0,0,0,0,0,6,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:62:mitigate-light',
						sources: arbitrarySourceValue,
						value: 6,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 7] });
			});
		});

		describe('passive 63', () => {
			const expectedOriginalId = '63';
			const ELEMENT_MAPPING = {
				1: UnitElement.Fire,
				2: UnitElement.Water,
				3: UnitElement.Earth,
				4: UnitElement.Thunder,
				5: UnitElement.Light,
				6: UnitElement.Dark,
			};

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(Object.values(ELEMENT_MAPPING).concat(['unknown']).map((elem) => `passive:63:first turn mitigate-${elem}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6,7,8';
				const expectedResult = Object.values(ELEMENT_MAPPING).map((element) => {
					return baseBuffFactory({
						id: `passive:63:first turn mitigate-${element}`,
						duration: 8,
						value: 7,
					});
				});

				const effect = { params };
				const context = createArbitraryContext();
				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,6,7,8,9,10,11';
				const expectedResult = Object.values(ELEMENT_MAPPING).map((element) => {
					return baseBuffFactory({
						id: `passive:63:first turn mitigate-${element}`,
						duration: 8,
						value: 7,
					});
				}).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
					value: {
						param_8: '9',
						param_9: '10',
						param_10: '11',
					},
				})]);

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to stat-specific properties when the params property does not exist', () => {
				const elements = Object.values(ELEMENT_MAPPING);
				const effect = elements.reduce((acc, element) => {
					acc[`mitigate ${element} attacks`] = true;
					return acc;
				}, {});
				effect['dmg% mitigation for elemental attacks'] = 14;
				effect['dmg% mitigation for elemental attacks buff for first x turns'] = 15;
				const expectedResult = elements.map((element) => {
					return baseBuffFactory({
						id: `passive:63:first turn mitigate-${element}`,
						duration: 15,
						value: 14,
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			Object.entries(ELEMENT_MAPPING).forEach(([knownElementKey, knownElementValue]) => {
				it(`parses raw value for ${knownElementValue} in params property`, () => {
					const params = `${knownElementKey},0,0,0,0,0,123,1`;
					const expectedResult = [baseBuffFactory({
						id: `passive:63:first turn mitigate-${knownElementValue}`,
						duration: 1,
						value: 123,
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`parses value for ${knownElementValue} when its effect property is true and not given params property`, () => {
					const effect = {
						[`mitigate ${knownElementValue} attacks`]: true,
						'dmg% mitigation for elemental attacks': 456,
						'dmg% mitigation for elemental attacks buff for first x turns': 2,
					};
					const expectedResult = [baseBuffFactory({
						id: `passive:63:first turn mitigate-${knownElementValue}`,
						duration: 2,
						value: 456,
					})];

					const context = createArbitraryContext();
					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});

				it(`returns an unknown element buff for ${knownElementValue} when its effect property is false and not given params property`, () => {
					const effect = {
						[`mitigate ${knownElementValue} attacks`]: false,
						'dmg% mitigation for elemental attacks': 456,
						'dmg% mitigation for elemental attacks buff for first x turns': 2,
					};
					const expectedResult = [baseBuffFactory({
						id: 'passive:63:first turn mitigate-unknown',
						duration: 2,
						value: 456,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('defaults to unknown element if corresponding element value cannot be found from parsed params', () => {
				const params = 'not-an-element,0,0,0,0,0,789,1';
				const expectedResult = [baseBuffFactory({
					id: 'passive:63:first turn mitigate-unknown',
					duration: 1,
					value: 789,
				})];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff if parsed mitigation value from params is zero', () => {
				const params = '1,2,3,4,5,6,0,8';
				const effect = { params };
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '5,0,0,0,0,0,6,7,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:63:first turn mitigate-light',
						sources: arbitrarySourceValue,
						duration: 7,
						value: 6,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 8] });
			});
		});

		describe('passive 64', () => {
			const BURST_TYPES = ['bb', 'sbb', 'ubb'];
			const expectedOriginalId = '64';

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(BURST_TYPES.map((burstType) => `passive:64:attack boost-${burstType}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3';
				const splitParams = params.split(',');
				const expectedResult = BURST_TYPES.map((burstType, index) => {
					return baseBuffFactory({
						id: `passive:64:attack boost-${burstType}`,
						value: +(splitParams[index]),
					});
				});

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,6';
				const splitParams = params.split(',');
				const expectedResult = BURST_TYPES.map((burstType, index) => {
					return baseBuffFactory({
						id: `passive:64:attack boost-${burstType}`,
						value: +(splitParams[index]),
					});
				}).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
					value: {
						param_3: '4',
						param_4: '5',
						param_5: '6',
					},
				})]);

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to stat-specific properties when the params property does not exist', () => {
				const mockValues = [5, 6, 7];
				const effect = BURST_TYPES.reduce((acc, type, index) => {
					acc[`${type} atk% buff`] = mockValues[index];
					return acc;
				}, {});
				const expectedResult = BURST_TYPES.map((burstType, index) => {
					return baseBuffFactory({
						id: `passive:64:attack boost-${burstType}`,
						value: mockValues[index],
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			BURST_TYPES.forEach((burstCase) => {
				it(`returns only value for ${burstCase} if it is non-zero and other non-turn values are 0`, () => {
					const params = BURST_TYPES.map((type) => type === burstCase ? '123' : '0').join(',');
					const effect = { params };
					const expectedResult = [baseBuffFactory({
						id: `passive:64:attack boost-${burstCase}`,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`returns only value for ${burstCase} if it is non-zero and other non-turn values are 0 when params property does not exist`, () => {
					const effect = { [`${burstCase} atk% buff`]: 456 };
					const expectedResult = [baseBuffFactory({
						id: `passive:64:attack boost-${burstCase}`,
						value: 456,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('defaults all effect properties to 0 for non-number values', () => {
				const effect = BURST_TYPES.reduce((acc, burstType) => {
					acc[`${burstType} atk% buff`] = 'not a number';
					return acc;
				}, {});
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,0,1,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:64:attack boost-ubb',
						sources: arbitrarySourceValue,
						value: 1,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 3] });
			});
		});

		describe('passive 65', () => {
			testPassiveWithNumericalValueRangeAndChance({
				expectedOriginalId: '65',
				expectedBuffId: 'passive:65:bc fill on crit',
				effectKeyLow: 'bc fill on crit min',
				effectKeyHigh: 'bc fill on crit max',
				effectKeyChance: 'bc fill on crit%',
				buffKeyLow: 'fillLow',
				buffKeyHigh: 'fillHigh',
				getExpectedValueFromParam: (param) => +param / 100,
				generateBaseConditions: () => ({ onCriticalHit: true }),
			});
		});

		describe('passive 66', () => {
			const BURST_TYPES = ['bb', 'sbb', 'ubb'];
			const expectedOriginalId = '66';

			const arbitraryKnownProcId = 'arbitrary proc id for passive 66';
			const getArbitraryBuffsForProcEffect = () => [{ arbitrary: 'proc buff' }];
			let mockProcEffectConversionFunctionSpy;
			let injectionContext;

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);

				mockProcEffectConversionFunctionSpy = jasmine.createSpy('mockProcEffectConversionFunctionSpy');
				mockProcEffectConversionFunctionSpy.and.callFake(() => getArbitraryBuffsForProcEffect());
				injectionContext = { convertProcEffectToBuffs: mockProcEffectConversionFunctionSpy };
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(BURST_TYPES.map((b) => `passive:66:add effect to skill-${b}`));

			it('uses the params property when it exists', () => {
				const params = `${arbitraryKnownProcId},2,3,4,5,1,1,1`;
				const expectedResult = BURST_TYPES.map((b) => {
					return baseBuffFactory({
						id: `passive:66:add effect to skill-${b}`,
						value: getArbitraryBuffsForProcEffect(),
					});
				});

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext(), injectionContext);
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `${arbitraryKnownProcId},2,3,4,5,1,1,1,9,10,11`;
				const expectedResult = BURST_TYPES.map((b) => {
					return baseBuffFactory({
						id: `passive:66:add effect to skill-${b}`,
						value: getArbitraryBuffsForProcEffect(),
					});
				}).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
					value: {
						param_8: '9',
						param_9: '10',
						param_10: '11',
					},
				})]);

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext(), injectionContext);
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = {
					'triggered effect': [{ 'proc id': arbitraryKnownProcId }],
					'trigger on bb': true,
					'trigger on sbb': true,
					'trigger on ubb': true,
				};
				const expectedResult = BURST_TYPES.map((b) => {
					return baseBuffFactory({
						id: `passive:66:add effect to skill-${b}`,
						value: getArbitraryBuffsForProcEffect(),
					});
				});

				const result = mappingFunction(effect, createArbitraryContext(), injectionContext);
				expect(result).toEqual(expectedResult);
			});

			describe('when trigger burst types are missing or false', () => {
				BURST_TYPES.forEach((burstCase) => {
					it(`returns a single buff for ${burstCase} if it is the only one that is true`, () => {
						const params = [
							`${arbitraryKnownProcId},2,3,4,5`,
							...BURST_TYPES.map((b) => b === burstCase ? '1' : '0'),
						].join(',');
						const expectedResult = [baseBuffFactory({
							id: `passive:66:add effect to skill-${burstCase}`,
							value: getArbitraryBuffsForProcEffect(),
						})];

						const effect = { params };
						const result = mappingFunction(effect, createArbitraryContext(), injectionContext);
						expect(result).toEqual(expectedResult);
					});

					it(`returns a single buff for ${burstCase} if it is the only one that is true and params property does not exist`, () => {
						const triggerValues = BURST_TYPES.reduce((acc, b) => {
							acc[`trigger on ${b}`] = b === burstCase;
							return acc;
						}, {});
						const effect = {
							'triggered effect': [{ 'proc id': arbitraryKnownProcId }],
							...triggerValues,
						};
						const expectedResult = [baseBuffFactory({
							id: `passive:66:add effect to skill-${burstCase}`,
							value: getArbitraryBuffsForProcEffect(),
						})];

						const result = mappingFunction(effect, createArbitraryContext(), injectionContext);
						expect(result).toEqual(expectedResult);
					});

					it(`returns a single buff for ${burstCase} if it is the only one that is present and params property does not exist`, () => {
						const triggerValues = BURST_TYPES.reduce((acc, b) => {
							if (b === burstCase) {
								acc[`trigger on ${b}`] = true;
							}
							return acc;
						}, {});
						const effect = {
							'triggered effect': [{ 'proc id': arbitraryKnownProcId }],
							...triggerValues,
						};
						const expectedResult = [baseBuffFactory({
							id: `passive:66:add effect to skill-${burstCase}`,
							value: getArbitraryBuffsForProcEffect(),
						})];

						const result = mappingFunction(effect, createArbitraryContext(), injectionContext);
						expect(result).toEqual(expectedResult);
					});
				});

				it('returns a no params buff if no burst types are true', () => {
					const params = `${arbitraryKnownProcId},2,3,4,5,0,0,0`;
					const effect = { params };
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), injectionContext });
				});

				it('returns a no params buff if no burst types are true and params property does not exist', () => {
					const triggerValues = BURST_TYPES.reduce((acc, b) => {
						acc[`trigger on ${b}`] = false;
						return acc;
					}, {});
					const effect = {
						'triggered effect': [{ 'proc id': arbitraryKnownProcId }],
						...triggerValues,
					};
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), injectionContext });
				});

				it('returns a no params buff if no burst types are present', () => {
					const params = `${arbitraryKnownProcId}`;
					expectNoParamsBuffWithEffectAndContext({ effect: { params }, context: createArbitraryContext(), injectionContext });
				});

				it('returns a no params buff if no burst types are present and params property does not exist', () => {
					const effect = {
						'triggered effect': [{ 'proc id': arbitraryKnownProcId }],
					};
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), injectionContext });
				});
			});

			describe('when parsing proc effects', () => {
				it('calls corresponding proc effect conversion function', () => {
					const params = `${arbitraryKnownProcId},2&3&4,123,456,4,1,1,1`;
					const expectedResult = BURST_TYPES.map((b) => {
						return baseBuffFactory({
							id: `passive:66:add effect to skill-${b}`,
							value: getArbitraryBuffsForProcEffect(),
						});
					});

					const effect = { params };
					const context = createArbitraryContext();
					const result = mappingFunction(effect, context, injectionContext);
					expect(result).toEqual(expectedResult);
					expect(mockProcEffectConversionFunctionSpy).toHaveBeenCalledWith({
						'proc id': arbitraryKnownProcId,
						params: '2,3,4',
						'effect delay time(ms)/frame': '66.7/4',
						'target area': '456',
						'target type': '123',
					}, context);
				});

				it('calls corresponding proc effect conversion function when params property does not exist', () => {
					const effect = {
						'triggered effect': [{
							'proc id': arbitraryKnownProcId,
							arbitraryProcProperty: 'proc triggered effect',
						}],
						'trigger on bb': true,
						'trigger on sbb': true,
						'trigger on ubb': true,
					};
					const expectedResult = BURST_TYPES.map((b) => {
						return baseBuffFactory({
							id: `passive:66:add effect to skill-${b}`,
							value: getArbitraryBuffsForProcEffect(),
						});
					});

					const context = createArbitraryContext();
					const result = mappingFunction(effect, context, injectionContext);
					expect(result).toEqual(expectedResult);
					expect(mockProcEffectConversionFunctionSpy).toHaveBeenCalledWith({
						'proc id': arbitraryKnownProcId,
						arbitraryProcProperty: 'proc triggered effect',
					}, context);
				});

				it('calls corresponding proc effect conversion function when not defined via injection context', () => {
					const params = `${arbitraryKnownProcId},2&3&4,123,456,4,1,1,1`;
					const expectedResult = BURST_TYPES.map((b) => {
						return baseBuffFactory({
							id: `passive:66:add effect to skill-${b}`,
							value: getArbitraryBuffsForProcEffect(),
						});
					});

					getProcEffectToBuffMapping(true).set(arbitraryKnownProcId, mockProcEffectConversionFunctionSpy);

					const effect = { params };
					const context = createArbitraryContext();
					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
					expect(mockProcEffectConversionFunctionSpy).toHaveBeenCalledWith({
						'proc id': arbitraryKnownProcId,
						params: '2,3,4',
						'effect delay time(ms)/frame': '66.7/4',
						'target area': '456',
						'target type': '123',
					}, context);
				});

				it('calls corresponding proc effect conversion function when not defined via injection context and params property does not exist', () => {
					const effect = {
						'triggered effect': [{
							'proc id': arbitraryKnownProcId,
							arbitraryProcProperty: 'proc triggered effect',
						}],
						'trigger on bb': true,
						'trigger on sbb': true,
						'trigger on ubb': true,
					};
					const expectedResult = BURST_TYPES.map((b) => {
						return baseBuffFactory({
							id: `passive:66:add effect to skill-${b}`,
							value: getArbitraryBuffsForProcEffect(),
						});
					});

					getProcEffectToBuffMapping(true).set(arbitraryKnownProcId, mockProcEffectConversionFunctionSpy);

					const context = createArbitraryContext();
					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
					expect(mockProcEffectConversionFunctionSpy).toHaveBeenCalledWith({
						'proc id': arbitraryKnownProcId,
						arbitraryProcProperty: 'proc triggered effect',
					}, context);
				});

				it('returns a no params buff if no triggered buffs are found', () => {
					const params = `${arbitraryKnownProcId},2&3&4,123,456,4,1,1,1`;
					const effect = { params };
					mockProcEffectConversionFunctionSpy.and.returnValue([]);

					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), injectionContext });
				});

				it('returns a no params buff if no triggered buffs are found and params property does not exist', () => {
					const effect = {
						'triggered effect': [{
							'proc id': arbitraryKnownProcId,
							arbitraryProcProperty: 'proc triggered effect',
						}],
						'trigger on bb': true,
						'trigger on sbb': true,
						'trigger on ubb': true,
					};
					mockProcEffectConversionFunctionSpy.and.returnValue([]);

					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), injectionContext });
				});

				it('returns a no params buff if triggered effect property is not an array and params property does not exist', () => {
					const effect = {
						'triggered effect': {
							'proc id': arbitraryKnownProcId,
							arbitraryProcProperty: 'proc triggered effect',
						},
						'trigger on bb': true,
						'trigger on sbb': true,
						'trigger on ubb': true,
					};

					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), injectionContext });
				});

				describe('and parsing their target type', () => {
					const TARGET_TYPE_MAPPING = {
						1: TargetType.Party,
						2: TargetType.Enemy,
						3: TargetType.Self,
					};
					Object.entries(TARGET_TYPE_MAPPING).forEach(([targetKey, targetValue]) => {
						it(`parses target type [${targetKey}] as [${targetValue}] for proc effect`, () => {
							const params = `${arbitraryKnownProcId},2&3&4,${targetKey},456,4,1,1,1`;
							const expectedResult = BURST_TYPES.map((b) => {
								return baseBuffFactory({
									id: `passive:66:add effect to skill-${b}`,
									value: getArbitraryBuffsForProcEffect(),
								});
							});

							const effect = { params };
							const context = createArbitraryContext();
							const result = mappingFunction(effect, context, injectionContext);
							expect(result).toEqual(expectedResult);
							expect(mockProcEffectConversionFunctionSpy).toHaveBeenCalledWith({
								'proc id': arbitraryKnownProcId,
								params: '2,3,4',
								'effect delay time(ms)/frame': '66.7/4',
								'target area': '456',
								'target type': targetValue,
							}, context);
						});
					});

					it('uses the input target type for proc effect if the parameter value does not have a mapping', () => {
						const params = `${arbitraryKnownProcId},2&3&4,arbitrary target type,456,4,1,1,1`;
						const expectedResult = BURST_TYPES.map((b) => {
							return baseBuffFactory({
								id: `passive:66:add effect to skill-${b}`,
								value: getArbitraryBuffsForProcEffect(),
							});
						});

						const effect = { params };
						const context = createArbitraryContext();
						const result = mappingFunction(effect, context, injectionContext);
						expect(result).toEqual(expectedResult);
						expect(mockProcEffectConversionFunctionSpy).toHaveBeenCalledWith({
							'proc id': arbitraryKnownProcId,
							params: '2,3,4',
							'effect delay time(ms)/frame': '66.7/4',
							'target area': '456',
							'target type': 'arbitrary target type',
						}, context);
					});

					it('sets target type for proc effect to [unknown target type] if input target type does not have a mapping and is falsy', () => {
						const params = `${arbitraryKnownProcId},2&3&4,,456,4,1,1,1`;
						const expectedResult = BURST_TYPES.map((b) => {
							return baseBuffFactory({
								id: `passive:66:add effect to skill-${b}`,
								value: getArbitraryBuffsForProcEffect(),
							});
						});

						const effect = { params };
						const context = createArbitraryContext();
						const result = mappingFunction(effect, context, injectionContext);
						expect(result).toEqual(expectedResult);
						expect(mockProcEffectConversionFunctionSpy).toHaveBeenCalledWith({
							'proc id': arbitraryKnownProcId,
							params: '2,3,4',
							'effect delay time(ms)/frame': '66.7/4',
							'target area': '456',
							'target type': 'unknown target type',
						}, context);
					});
				});

				describe('and parsing their target area', () => {
					const TARGET_AREA_MAPPING = {
						1: TargetArea.Single,
						2: TargetArea.Aoe,
					};
					Object.entries(TARGET_AREA_MAPPING).forEach(([targetKey, targetValue]) => {
						it(`parses target area [${targetKey}] as [${targetValue}] for proc effect`, () => {
							const params = `${arbitraryKnownProcId},2&3&4,123,${targetKey},4,1,1,1`;
							const expectedResult = BURST_TYPES.map((b) => {
								return baseBuffFactory({
									id: `passive:66:add effect to skill-${b}`,
									value: getArbitraryBuffsForProcEffect(),
								});
							});

							const effect = { params };
							const context = createArbitraryContext();
							const result = mappingFunction(effect, context, injectionContext);
							expect(result).toEqual(expectedResult);
							expect(mockProcEffectConversionFunctionSpy).toHaveBeenCalledWith({
								'proc id': arbitraryKnownProcId,
								params: '2,3,4',
								'effect delay time(ms)/frame': '66.7/4',
								'target area': targetValue,
								'target type': '123',
							}, context);
						});
					});

					it('uses the input target area for proc effect if the parameter value does not have a mapping', () => {
						const params = `${arbitraryKnownProcId},2&3&4,123,arbitrary target area,4,1,1,1`;
						const expectedResult = BURST_TYPES.map((b) => {
							return baseBuffFactory({
								id: `passive:66:add effect to skill-${b}`,
								value: getArbitraryBuffsForProcEffect(),
							});
						});

						const effect = { params };
						const context = createArbitraryContext();
						const result = mappingFunction(effect, context, injectionContext);
						expect(result).toEqual(expectedResult);
						expect(mockProcEffectConversionFunctionSpy).toHaveBeenCalledWith({
							'proc id': arbitraryKnownProcId,
							params: '2,3,4',
							'effect delay time(ms)/frame': '66.7/4',
							'target area': 'arbitrary target area',
							'target type': '123',
						}, context);
					});

					it('sets target area for proc effect to [unknown target area] if input target area does not have a mapping and is falsy', () => {
						const params = `${arbitraryKnownProcId},2&3&4,123,,4,1,1,1`;
						const expectedResult = BURST_TYPES.map((b) => {
							return baseBuffFactory({
								id: `passive:66:add effect to skill-${b}`,
								value: getArbitraryBuffsForProcEffect(),
							});
						});

						const effect = { params };
						const context = createArbitraryContext();
						const result = mappingFunction(effect, context, injectionContext);
						expect(result).toEqual(expectedResult);
						expect(mockProcEffectConversionFunctionSpy).toHaveBeenCalledWith({
							'proc id': arbitraryKnownProcId,
							params: '2,3,4',
							'effect delay time(ms)/frame': '66.7/4',
							'target area': 'unknown target area',
							'target type': '123',
						}, context);
					});
				});

				describe('and multiple proc entries exist', () => {
					const anotherArbitraryKnownProcId = 'another arbitrary proc id for passive 66';
					const getArbitraryBuffsForAnotherProcEffect = () => [{ anotherArbitrary: 'proc buff for the other proc id' }];
					let mockAnotherProcEffectConversionFunctionSpy;

					beforeEach(() => {
						mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
						baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);

						mockAnotherProcEffectConversionFunctionSpy = jasmine.createSpy('mockProcEffectConversionFunctionSpy');
						mockAnotherProcEffectConversionFunctionSpy.and.callFake(() => getArbitraryBuffsForAnotherProcEffect());

						const procMapping = getProcEffectToBuffMapping(true);
						procMapping.set(arbitraryKnownProcId, mockProcEffectConversionFunctionSpy);
						procMapping.set(anotherArbitraryKnownProcId, mockAnotherProcEffectConversionFunctionSpy);
					});

					it('calls corresponding proc effect conversion function for each proc buff', () => {
						const params = `${arbitraryKnownProcId}~${anotherArbitraryKnownProcId},2&3&4~5&6&7&8,123~321,456~654,4~1,1,1,1`;
						const expectedResult = BURST_TYPES.map((b) => {
							return baseBuffFactory({
								id: `passive:66:add effect to skill-${b}`,
								value: getArbitraryBuffsForProcEffect().concat(getArbitraryBuffsForAnotherProcEffect()),
							});
						});

						const effect = { params };
						const context = createArbitraryContext();
						const result = mappingFunction(effect, context);
						expect(result).toEqual(expectedResult);
						expect(mockProcEffectConversionFunctionSpy).toHaveBeenCalledWith({
							'proc id': arbitraryKnownProcId,
							params: '2,3,4',
							'effect delay time(ms)/frame': '66.7/4',
							'target area': '456',
							'target type': '123',
						}, context);
						expect(mockAnotherProcEffectConversionFunctionSpy).toHaveBeenCalledWith({
							'proc id': anotherArbitraryKnownProcId,
							params: '5,6,7,8',
							'effect delay time(ms)/frame': '16.7/1',
							'target area': '654',
							'target type': '321',
						}, context);
					});

					it('calls corresponding proc effect conversion function for each proc buff if params property does not exist', () => {
						const effect = {
							'triggered effect': [
								{
									'proc id': arbitraryKnownProcId,
									arbitraryProcProperty: 'proc triggered effect',
								},
								{
									'proc id': anotherArbitraryKnownProcId,
									anotherArbitraryProcProperty: 'proc triggered effect 2',
									extraProperty: 'extra property on second proc effect',
								},
							],
							'trigger on bb': true,
							'trigger on sbb': true,
							'trigger on ubb': true,
						};
						const expectedResult = BURST_TYPES.map((b) => {
							return baseBuffFactory({
								id: `passive:66:add effect to skill-${b}`,
								value: getArbitraryBuffsForProcEffect().concat(getArbitraryBuffsForAnotherProcEffect()),
							});
						});


						const context = createArbitraryContext();
						const result = mappingFunction(effect, context);
						expect(result).toEqual(expectedResult);
						expect(mockProcEffectConversionFunctionSpy).toHaveBeenCalledWith({
							'proc id': arbitraryKnownProcId,
							arbitraryProcProperty: 'proc triggered effect',
						}, context);
						expect(mockAnotherProcEffectConversionFunctionSpy).toHaveBeenCalledWith({
							'proc id': anotherArbitraryKnownProcId,
							anotherArbitraryProcProperty: 'proc triggered effect 2',
							extraProperty: 'extra property on second proc effect',
						}, context);
					});

					describe('and number of proc IDs is greater than given parameter data', () => {
						it('defaults missing proc params to empty string', () => {
							const params = `${arbitraryKnownProcId}~${anotherArbitraryKnownProcId},2&3&4,123~321,456~654,4~1,1,1,1`;
							const expectedResult = BURST_TYPES.map((b) => {
								return baseBuffFactory({
									id: `passive:66:add effect to skill-${b}`,
									value: getArbitraryBuffsForProcEffect().concat(getArbitraryBuffsForAnotherProcEffect()),
								});
							});

							const effect = { params };
							const context = createArbitraryContext();
							const result = mappingFunction(effect, context);
							expect(result).toEqual(expectedResult);
							expect(mockProcEffectConversionFunctionSpy).toHaveBeenCalledWith({
								'proc id': arbitraryKnownProcId,
								params: '2,3,4',
								'effect delay time(ms)/frame': '66.7/4',
								'target area': '456',
								'target type': '123',
							}, context);
							expect(mockAnotherProcEffectConversionFunctionSpy).toHaveBeenCalledWith({
								'proc id': anotherArbitraryKnownProcId,
								params: '',
								'effect delay time(ms)/frame': '16.7/1',
								'target area': '654',
								'target type': '321',
							}, context);
						});

						it('defaults missing target type property to [unknown target type]', () => {
							const params = `${arbitraryKnownProcId}~${anotherArbitraryKnownProcId},2&3&4~5&6&7&8,123,456~654,4~1,1,1,1`;
							const expectedResult = BURST_TYPES.map((b) => {
								return baseBuffFactory({
									id: `passive:66:add effect to skill-${b}`,
									value: getArbitraryBuffsForProcEffect().concat(getArbitraryBuffsForAnotherProcEffect()),
								});
							});

							const effect = { params };
							const context = createArbitraryContext();
							const result = mappingFunction(effect, context);
							expect(result).toEqual(expectedResult);
							expect(mockProcEffectConversionFunctionSpy).toHaveBeenCalledWith({
								'proc id': arbitraryKnownProcId,
								params: '2,3,4',
								'effect delay time(ms)/frame': '66.7/4',
								'target area': '456',
								'target type': '123',
							}, context);
							expect(mockAnotherProcEffectConversionFunctionSpy).toHaveBeenCalledWith({
								'proc id': anotherArbitraryKnownProcId,
								params: '5,6,7,8',
								'effect delay time(ms)/frame': '16.7/1',
								'target area': '654',
								'target type': 'unknown target type',
							}, context);
						});

						it('defaults missing target area property to [unknown target area]', () => {
							const params = `${arbitraryKnownProcId}~${anotherArbitraryKnownProcId},2&3&4~5&6&7&8,123~321,456,4~1,1,1,1`;
							const expectedResult = BURST_TYPES.map((b) => {
								return baseBuffFactory({
									id: `passive:66:add effect to skill-${b}`,
									value: getArbitraryBuffsForProcEffect().concat(getArbitraryBuffsForAnotherProcEffect()),
								});
							});

							const effect = { params };
							const context = createArbitraryContext();
							const result = mappingFunction(effect, context);
							expect(result).toEqual(expectedResult);
							expect(mockProcEffectConversionFunctionSpy).toHaveBeenCalledWith({
								'proc id': arbitraryKnownProcId,
								params: '2,3,4',
								'effect delay time(ms)/frame': '66.7/4',
								'target area': '456',
								'target type': '123',
							}, context);
							expect(mockAnotherProcEffectConversionFunctionSpy).toHaveBeenCalledWith({
								'proc id': anotherArbitraryKnownProcId,
								params: '5,6,7,8',
								'effect delay time(ms)/frame': '16.7/1',
								'target area': 'unknown target area',
								'target type': '321',
							}, context);
						});

						it('defaults missing start frame property to 0', () => {
							const params = `${arbitraryKnownProcId}~${anotherArbitraryKnownProcId},2&3&4~5&6&7&8,123~321,456~654,4,1,1,1`;
							const expectedResult = BURST_TYPES.map((b) => {
								return baseBuffFactory({
									id: `passive:66:add effect to skill-${b}`,
									value: getArbitraryBuffsForProcEffect().concat(getArbitraryBuffsForAnotherProcEffect()),
								});
							});

							const effect = { params };
							const context = createArbitraryContext();
							const result = mappingFunction(effect, context);
							expect(result).toEqual(expectedResult);
							expect(mockProcEffectConversionFunctionSpy).toHaveBeenCalledWith({
								'proc id': arbitraryKnownProcId,
								params: '2,3,4',
								'effect delay time(ms)/frame': '66.7/4',
								'target area': '456',
								'target type': '123',
							}, context);
							expect(mockAnotherProcEffectConversionFunctionSpy).toHaveBeenCalledWith({
								'proc id': anotherArbitraryKnownProcId,
								params: '5,6,7,8',
								'effect delay time(ms)/frame': '0.0/0',
								'target area': '654',
								'target type': '321',
							}, context);
						});
					});
				});
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext(), injectionContext });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: `${arbitraryKnownProcId},2,3,4,5,1,0,0,789`,
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:66:add effect to skill-bb',
						sources: arbitrarySourceValue,
						value: getArbitraryBuffsForProcEffect(),
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				injectionContext = { ...injectionContext, ...createDefaultInjectionContext() };
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 8] });
			});
		});

		describe('passive 69', () => {
			const expectedBuffId = 'passive:69:chance ko resistance';
			const expectedOriginalId = '69';

			const RECOVERED_HP_BUFF_KEY = 'recoveredHp%';
			const PARAMS_ORDER = [RECOVERED_HP_BUFF_KEY, 'maxCount', 'chanceLow', 'chanceHigh'];
			const EFFECT_KEY_MAPPING = {
				'angel idol recover hp%': RECOVERED_HP_BUFF_KEY,
				'angel idol recover counts': 'maxCount',
				'angel idol recover chance% low': 'chanceLow',
				'angel idol recover chance% high': 'chanceHigh',
			};

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4';
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						[RECOVERED_HP_BUFF_KEY]: 1,
						maxCount: 2,
						chanceLow: 3,
						chanceHigh: 4,
					},
				})];
				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,6,7';
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: {
							[RECOVERED_HP_BUFF_KEY]: 1,
							maxCount: 2,
							chanceLow: 3,
							chanceHigh: 4,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_4: '5',
							param_5: '6',
							param_6: '7',
						},
					}),
				];
				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to stat-specific properties when the params property does not exist', () => {
				const effect = {
					'angel idol recover hp%': 5,
					'angel idol recover counts': 6,
					'angel idol recover chance% low': 7,
					'angel idol recover chance% high': 8,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						[RECOVERED_HP_BUFF_KEY]: 5,
						maxCount: 6,
						chanceLow: 7,
						chanceHigh: 8,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are missing or 0', () => {
				Object.entries(EFFECT_KEY_MAPPING).forEach(([effectKey, buffKey]) => {
					it(`defaults to 0 for missing ${buffKey} parameter`, () => {
						const params = PARAMS_ORDER.map((p) => p !== buffKey ? '123' : '').join(',');
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							value: {
								[RECOVERED_HP_BUFF_KEY]: buffKey !== RECOVERED_HP_BUFF_KEY ? 123 : 0,
								maxCount: buffKey !== 'maxCount' ? 123 : 0,
								chanceLow: buffKey !== 'chanceLow' ? 123 : 0,
								chanceHigh: buffKey !== 'chanceHigh' ? 123 : 0,
							},
						})];

						const effect = { params };
						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});

					it(`defaults to 0 for missing ${buffKey} parameter if params property does not exist`, () => {
						const effect = Object.keys(EFFECT_KEY_MAPPING).reduce((acc, localEffectKey) => {
							if (localEffectKey !== effectKey) {
								acc[localEffectKey] = 456;
							}
							return acc;
						}, {});
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							value: {
								[RECOVERED_HP_BUFF_KEY]: buffKey !== RECOVERED_HP_BUFF_KEY ? 456 : 0,
								maxCount: buffKey !== 'maxCount' ? 456 : 0,
								chanceLow: buffKey !== 'chanceLow' ? 456 : 0,
								chanceHigh: buffKey !== 'chanceHigh' ? 456 : 0,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				it('returns a no params buff when no parameters are given', () => {
					expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
				});

				it('returns a no params buff if chanceLow and chanceHigh are 0', () => {
					const effect = { params: '123,456,0,0' };
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('returns a no params buff if chanceLow and chanceHigh are 0 and params property does not exist', () => {
					const effect = {
						'angel idol recover hp%': 12,
						'angel idol recover counts': 34,
						'angel idol recover chance% low': 0,
						'angel idol recover chance% high': 0,
					};
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '1,2,3,4,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: {
							[RECOVERED_HP_BUFF_KEY]: 1,
							maxCount: 2,
							chanceLow: 3,
							chanceHigh: 4,
						},
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 4] });
			});
		});

		describe('passive 70', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '70',
				expectedBuffId: 'passive:70:od fill rate',
				effectKey: 'od fill rate%',
			});
		});

		describe('passive 71', () => {
			const expectedOriginalId = '71';

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(AILMENTS_ORDER.map((ailment) => `passive:71:inflict on hit-${ailment}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6';
				const splitParams = params.split(',');
				const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
					return baseBuffFactory({
						id: `passive:71:inflict on hit-${ailment}`,
						value: +(splitParams[index]),
					});
				});

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,6,7,8,9';
				const splitParams = params.split(',');
				const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
					return baseBuffFactory({
						id: `passive:71:inflict on hit-${ailment}`,
						value: +(splitParams[index]),
					});
				}).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
					value: {
						param_6: '7',
						param_7: '8',
						param_8: '9',
					},
				})]);

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to ailment-specific properties when the params property does not exist', () => {
				const mockValues = [7, 8, 9, 10, 11, 12];
				const effect = AILMENTS_ORDER.reduce((acc, ailment, index) => {
					acc[`counter inflict ${ailment !== 'weak' ? ailment : 'weaken'}%`] = mockValues[index];
					return acc;
				}, {});

				const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
					return baseBuffFactory({
						id: `passive:71:inflict on hit-${ailment}`,
						value: mockValues[index],
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			AILMENTS_ORDER.forEach((ailmentCase) => {
				it(`returns only value for ${ailmentCase} if it is non-zero and other stats are zero`, () => {
					const params = AILMENTS_ORDER.map((ailment) => ailment === ailmentCase ? '123' : '0').join(',');
					const expectedResult = [baseBuffFactory({
						id: `passive:71:inflict on hit-${ailmentCase}`,
						value: 123,
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`returns only value for ${ailmentCase} if it is non-zero and other stats are zero and params property does not exist`, () => {
					const effect = AILMENTS_ORDER.reduce((acc, ailment) => {
						acc[`counter inflict ${ailment !== 'weak' ? ailment : 'weaken'}%`] = ailment !== ailmentCase ? 0 : 123;
						return acc;
					}, {});
					const expectedResult = [baseBuffFactory({
						id: `passive:71:inflict on hit-${ailmentCase}`,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`returns only value for ${ailmentCase} if the only present stat are zero and params property does not exist`, () => {
					const effect = { [`counter inflict ${ailmentCase !== 'weak' ? ailmentCase : 'weaken'}%`]: 123 };
					const expectedResult = [baseBuffFactory({
						id: `passive:71:inflict on hit-${ailmentCase}`,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('defaults all params properties to 0 for non-number values', () => {
				const effect = { params: 'not a number' };
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('defaults all effect properties to 0 for non-number values and params property does not exist', () => {
				const effect = AILMENTS_ORDER.reduce((acc, ailment) => {
					acc[`counter inflict ${ailment !== 'weak' ? ailment : 'weaken'}%`] = 'not a number';
					return acc;
				}, {});
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,0,0,0,0,456,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:71:inflict on hit-paralysis',
						sources: arbitrarySourceValue,
						value: 456,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 6] });
			});
		});

		describe('passive 72', () => {
			const expectedBuffIdForHp = 'passive:72:effect at turn start-hp';
			const expectedBuffIdForBc = 'passive:72:effect at turn start-bc';
			const expectedOriginalId = '72';

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffIdForHp, expectedBuffIdForBc]);

			it('uses the params property when it exists', () => {
				const params = '1,1';
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForHp,
						value: true,
					}),
					baseBuffFactory({
						id: expectedBuffIdForBc,
						value: true,
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,1,3,4,5';
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForHp,
						value: true,
					}),
					baseBuffFactory({
						id: expectedBuffIdForBc,
						value: true,
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_2: '3',
							param_3: '4',
							param_4: '5',
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to unknown passive params property when params property does not exist', () => {
				const params = '1,1';
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForHp,
						value: true,
					}),
					baseBuffFactory({
						id: expectedBuffIdForBc,
						value: true,
					}),
				];

				const effect = { 'unknown passive params': params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are missing or 0', () => {
				it('returns only buff for BC if HP parameter is missing', () => {
					const params = ',1';
					const expectedResult = [baseBuffFactory({
						id: expectedBuffIdForBc,
						value: true,
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns only buff for HP if BC parameter is missing', () => {
					const params = '1,';
					const expectedResult = [baseBuffFactory({
						id: expectedBuffIdForHp,
						value: true,
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns only buff for BC if HP parameter is not 1', () => {
					const params = '0,1';
					const expectedResult = [baseBuffFactory({
						id: expectedBuffIdForBc,
						value: true,
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns only buff for HP if BC parameter is not 1', () => {
					const params = '1,0';
					const expectedResult = [baseBuffFactory({
						id: expectedBuffIdForHp,
						value: true,
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a no params buff when no parameters are given', () => {
					expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
				});
			});

			it('returns a no params buff when both HP and BC parameters are not 1', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: { params: '123,456' }, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '1,1,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForHp,
						sources: arbitrarySourceValue,
						conditions: arbitraryConditionValue,
						value: true,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: expectedBuffIdForBc,
						sources: arbitrarySourceValue,
						conditions: arbitraryConditionValue,
						value: true,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 2] });
			});
		});

		describe('passive 73', () => {
			const AILMENTS_ORDER = ['poison', 'weak', 'sick', 'injury', 'curse', 'paralysis', 'atk down', 'def down', 'rec down'];
			const expectedOriginalId = '73';

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(AILMENTS_ORDER.map((ailment) => `passive:73:resist-${ailment}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6,7,8,9';
				const splitParams = params.split(',');
				const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
					return baseBuffFactory({
						id: `passive:73:resist-${ailment}`,
						value: +(splitParams[index]),
					});
				});

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,6,7,8,9,10,11,12';
				const splitParams = params.split(',');
				const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
					return baseBuffFactory({
						id: `passive:73:resist-${ailment}`,
						value: +(splitParams[index]),
					});
				}).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
					value: {
						param_9: '10',
						param_10: '11',
						param_11: '12',
					},
				})]);

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to ailment-specific properties when the params property does not exist', () => {
				const mockValues = [10, 11, 12, 13, 14, 15, 16, 17, 18];
				const effect = AILMENTS_ORDER.reduce((acc, ailment, index) => {
					acc[`${ailment !== 'weak' ? ailment : 'weaken'} resist%`] = mockValues[index];
					return acc;
				}, {});

				const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
					return baseBuffFactory({
						id: `passive:73:resist-${ailment}`,
						value: mockValues[index],
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			AILMENTS_ORDER.forEach((ailmentCase) => {
				it(`returns only value for ${ailmentCase} if it is non-zero and other stats are zero`, () => {
					const params = AILMENTS_ORDER.map((ailment) => ailment === ailmentCase ? '123' : '0').join(',');
					const expectedResult = [baseBuffFactory({
						id: `passive:73:resist-${ailmentCase}`,
						value: 123,
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`returns only value for ${ailmentCase} if it is non-zero and other stats are zero and params property does not exist`, () => {
					const effect = AILMENTS_ORDER.reduce((acc, ailment) => {
						acc[`${ailment !== 'weak' ? ailment : 'weaken'} resist%`] = ailment !== ailmentCase ? 0 : 123;
						return acc;
					}, {});
					const expectedResult = [baseBuffFactory({
						id: `passive:73:resist-${ailmentCase}`,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`returns only value for ${ailmentCase} if the only present stat are zero and params property does not exist`, () => {
					const effect = { [`${ailmentCase !== 'weak' ? ailmentCase : 'weaken'} resist%`]: 123 };
					const expectedResult = [baseBuffFactory({
						id: `passive:73:resist-${ailmentCase}`,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('defaults all params properties to 0 for non-number values', () => {
				const effect = { params: 'not a number' };
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('defaults all effect properties to 0 for non-number values and params property does not exist', () => {
				const effect = AILMENTS_ORDER.reduce((acc, ailment) => {
					acc[`${ailment !== 'weak' ? ailment : 'weaken'} resist%`] = 'not a number';
					return acc;
				}, {});
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,0,0,0,0,0,0,0,456,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'passive:73:resist-rec down',
						sources: arbitrarySourceValue,
						value: 456,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 9] });
			});
		});

		describe('passive 74', () => {
			const expectedBuffId = 'passive:74:ailment attack boost';
			const expectedOriginalId = '74';

			const ATTACK_BOOST_EFFECT_KEY = 'atk% buff when enemy has ailment';
			const ailmentKeyNamePairs = Object.entries(AILMENT_MAPPING);

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = '1,2';
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: 2,
					conditions: {
						targetHasAnyOfGivenAilments: ['poison'],
					},
				})];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5';
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: 2,
						conditions: {
							targetHasAnyOfGivenAilments: ['poison'],
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_2: '3',
							param_3: '4',
							param_4: '5',
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = {
					'atk% buff when enemy has poison': true,
					[ATTACK_BOOST_EFFECT_KEY]: 4,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: 4,
					conditions: {
						targetHasAnyOfGivenAilments: ['poison'],
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			ailmentKeyNamePairs.forEach(([ailmentKey, ailmentName]) => {
				it(`parses ailment parameter [${ailmentKey}] for [${ailmentName}]`, () => {
					const params = `${ailmentKey},123`;
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: 123,
						conditions: {
							targetHasAnyOfGivenAilments: [ailmentName],
						},
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				// effect does not support stat reduction buffs when not using params property
				if (!['atk down', 'def down', 'rec down'].includes(ailmentName)) {
					it(`parses ailment for [${ailmentName}] when params property does not exist`, () => {
						const ailmentEffectKey = `atk% buff when enemy has ${ailmentName !== 'weak' ? ailmentName : 'weaken'}`;
						const effect = {
							[ailmentEffectKey]: true,
							[ATTACK_BOOST_EFFECT_KEY]: 456,
						};
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							value: 456,
							conditions: {
								targetHasAnyOfGivenAilments: [ailmentName],
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				}
			});

			it('parses multiple ailments', () => {
				const params = `${ailmentKeyNamePairs.map(([key]) => key).join('&')},123`;
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: 123,
					conditions: {
						targetHasAnyOfGivenAilments: ailmentKeyNamePairs.map(([,name]) => name),
					},
				})];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('parses multiple ailments when params property does not exist', () => {
				// note that ATK/DEF/REC down is not supported when not using params property, which is why AILMENTS_ORDER is used here
				// and not the `ailmentKeyNamePairs` variable
				const effect = AILMENTS_ORDER.reduce((acc, name) => {
					const ailmentEffectKey = `atk% buff when enemy has ${name !== 'weak' ? name : 'weaken'}`;
					acc[ailmentEffectKey] = true;
					return acc;
				}, {});
				effect[ATTACK_BOOST_EFFECT_KEY] = 456;
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: 456,
					conditions: {
						targetHasAnyOfGivenAilments: AILMENTS_ORDER,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('ignores ailment parameters that are 0', () => {
				const params = '0&2&0&4,123';
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: 123,
					conditions: {
						targetHasAnyOfGivenAilments: ['weak', 'injury'],
					},
				})];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('ignores ailment properties that are not specifically the boolean "true" when the params property does not exist', () => {
				const effect = {
					'atk% buff when enemy has poison': false,
					'atk% buff when enemy has weaken': { some: 'truthy value'},
					'atk% buff when enemy has sick': 123,
					'atk% buff when enemy has injury': ['another truthy value'],
					'atk% buff when enemy has curse': 'true',
					'atk% buff when enemy has paralysis': true,
					[ATTACK_BOOST_EFFECT_KEY]: 456,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: 456,
					conditions: {
						targetHasAnyOfGivenAilments: ['paralysis'],
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('parses unmapped ailment parameters to "unknown"', () => {
				const params = '123&456,789';
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: 789,
					conditions: {
						targetHasAnyOfGivenAilments: ['unknown', 'unknown'],
					},
				})];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns ailment condition as an empty array if no ailments are present', () => {
				const params = '0,123';
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: 123,
					conditions: {
						targetHasAnyOfGivenAilments: [],
					},
				})];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns ailment condition as an empty array if no ailments are present and params property does not exist', () => {
				const effect = { [ATTACK_BOOST_EFFECT_KEY]: 456 };
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: 456,
					conditions: {
						targetHasAnyOfGivenAilments: [],
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('returns a no params buff if attack boost is 0', () => {
				const params = '1&2&3,0';
				const effect = { params };
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '1,2,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: 2,
						conditions: {
							...arbitraryConditionValue,
							targetHasAnyOfGivenAilments: ['poison'],
						},
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 2] });
			});
		});

		describe('passive 75', () => {
			const expectedBuffId = 'passive:75:spark vulnerability';
			const expectedOriginalId = '75';

			const DAMAGE_BUFF_KEY = 'sparkDamage%';
			const EFFECT_KEY_MAPPING = {
				'sparkDamage%': 'spark debuff%',
				chance: 'spark debuff chance%',
				turnDuration: 'spark debuff turns',
			};
			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = '1,2,3';
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 3,
					value: { [DAMAGE_BUFF_KEY]: 1, chance: 2 },
				})];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,6';
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: 3,
						value: { [DAMAGE_BUFF_KEY]: 1, chance: 2 },
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_3: '4',
							param_4: '5',
							param_5: '6',
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = {
					[EFFECT_KEY_MAPPING.chance]: 4,
					[EFFECT_KEY_MAPPING['sparkDamage%']]: 5,
					[EFFECT_KEY_MAPPING.turnDuration]: 6,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 6,
					value: { chance: 4, [DAMAGE_BUFF_KEY]: 5 },
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are 0 or missing', () => {
				it('defaults to 0 for missing recovered HP parameter', () => {
					const params = `,1,${123}`;
					const effect = { params };
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: 123,
						value: { chance: 1, [DAMAGE_BUFF_KEY]: 0 },
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for missing recovered HP parameter when params property does not exist', () => {
					const effect = {
						[EFFECT_KEY_MAPPING.chance]: 4,
						[EFFECT_KEY_MAPPING.turnDuration]: 456,
					};
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: 456,
						value: { chance: 4, [DAMAGE_BUFF_KEY]: 0 },
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a no params buff when no parameters are given', () => {
					expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
				});

				it('returns a no params buff if chance is 0 and turn duration is 0', () => {
					const params = '1,0,0';
					const effect = { params };

					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('returns a no params buff if chance is 0 and turn duration is 0 and params property does not exist', () => {
					const effect = {
						[EFFECT_KEY_MAPPING.chance]: 0,
						[EFFECT_KEY_MAPPING['sparkDamage%']]: 5,
						[EFFECT_KEY_MAPPING.turnDuration]: 0,
					};
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '1,2,3,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						duration: 3,
						value: { [DAMAGE_BUFF_KEY]: 1, chance: 2 },
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 3] });
			});
		});

		describe('passive 77', () => {
			const expectedBuffIdForBase = 'passive:77:spark damage reduction-base';
			const expectedBuffIdForBuff = 'passive:77:spark damage reduction-buff';
			const BASE_EFFECT_KEY = 'base spark dmg% resist';
			const BUFF_EFFECT_KEY = 'buff spark dmg% resist';
			const expectedOriginalId = '77';

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffIdForBase, expectedBuffIdForBuff]);

			it('uses the params property when it exists', () => {
				const params = '1,2';
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForBase,
						value: 1,
					}),
					baseBuffFactory({
						id: expectedBuffIdForBuff,
						value: 2,
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5';
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForBase,
						value: 1,
					}),
					baseBuffFactory({
						id: expectedBuffIdForBuff,
						value: 2,
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_2: '3',
							param_3: '4',
							param_4: '5',
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});


			it('falls back to effect properties when the params property does not exist', () => {
				const effect = {
					[BASE_EFFECT_KEY]: 3,
					[BUFF_EFFECT_KEY]: 4,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForBase,
						value: 3,
					}),
					baseBuffFactory({
						id: expectedBuffIdForBuff,
						value: 4,
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('parses effect properties to number when the params property does not exist', () => {
				const effect = {
					[BASE_EFFECT_KEY]: '5',
					[BUFF_EFFECT_KEY]: '6',
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForBase,
						value: 5,
					}),
					baseBuffFactory({
						id: expectedBuffIdForBuff,
						value: 6,
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('for missing or 0 values', () => {
				it('returns only value for base if it is non-zero and buff is 0', () => {
					const effect = { params: '123,0' };

					const expectedResult = [baseBuffFactory({
						id: expectedBuffIdForBase,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns only value for buff if it is non-zero and base is 0', () => {
					const effect = { params: '0,123' };

					const expectedResult = [baseBuffFactory({
						id: expectedBuffIdForBuff,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns only value for base if it is non-zero and buff is 0 and params property does not exist', () => {
					const effect = { [BASE_EFFECT_KEY]: 456 };

					const expectedResult = [baseBuffFactory({
						id: expectedBuffIdForBase,
						value: 456,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns only value for buff if it is non-zero and base is 0 and params property does not exist', () => {
					const effect = { [BUFF_EFFECT_KEY]: 456 };

					const expectedResult = [baseBuffFactory({
						id: expectedBuffIdForBuff,
						value: 456,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a no params buff when no parameters are given', () => {
					expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
				});

				it('defaults all params properties to 0 for non-number values', () => {
					const effect = { params: 'not a number' };
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('defaults all effect properties to 0 for non-number values and params property does not exist', () => {
					const effect = {
						[BASE_EFFECT_KEY]: 'not a number',
						[BUFF_EFFECT_KEY]: 'not a number',
					};
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '1,0,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForBase,
						sources: arbitrarySourceValue,
						value: 1,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 2] });
			});
		});

		describe('passive 78', () => {
			testConditionalPassiveWithSingleNumericalCondition({
				expectedOriginalId: '78',
				expectedBuffId: 'passive:78:damage taken conditional',
				getExpectedConditionsFromParam: (param) => ({ damageTakenExceeds: param }),
			});
		});

		describe('passive 79', () => {
			testConditionalBcFillWithSingleNumericalCondition({
				expectedFlatFillBuffId: 'passive:79:bc fill after damage taken conditional-flat',
				expectedPercentFillBuffId: 'passive:79:bc fill after damage taken conditional-percent',
				expectedOriginalId: '79',
				flatFillEffectKey: 'increase bb gauge',
				conditionalThresholdEffectKey: 'damage threshold activation',
				getExpectedConditionsFromParam: (param) => ({ damageTakenExceeds: param }),
			});
		});

		describe('passive 80', () => {
			const expectedBuffId = 'passive:80:damage dealt conditional';
			const expectedOriginalId = '80';

			const arbitraryKnownConditionalId = 'arbitrary conditional id for passive 80';
			const getArbitraryBuffsForConditionalEffect = () => [{ arbitrary: 'conditional buff' }];
			let mockConditionalEffectConversionFunctionSpy;
			let injectionContext;

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);

				mockConditionalEffectConversionFunctionSpy = jasmine.createSpy('mockConditionalEffectConversionFunctionSpy');
				mockConditionalEffectConversionFunctionSpy.and.callFake(() => getArbitraryBuffsForConditionalEffect());
				injectionContext = { convertConditionalEffectToBuffs: mockConditionalEffectConversionFunctionSpy };
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = `${arbitraryKnownConditionalId},2,3,4,5`;
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						triggeredBuffs: getArbitraryBuffsForConditionalEffect(),
						maxTriggerCount: 3,
					},
					conditions: {
						damageDealtExceeds: 4,
					},
				})];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext(), injectionContext);
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `${arbitraryKnownConditionalId},2,3,4,5,6,7,8`;
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: {
							triggeredBuffs: getArbitraryBuffsForConditionalEffect(),
							maxTriggerCount: 3,
						},
						conditions: {
							damageDealtExceeds: 4,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_5: '6',
							param_6: '7',
							param_7: '8',
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext(), injectionContext);
				expect(result).toEqual(expectedResult);
			});

			it('calls corresponding conditional effect conversion function defined in injection context', () => {
				const params = `${arbitraryKnownConditionalId},2&3&4,3,4,5`;
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						triggeredBuffs: getArbitraryBuffsForConditionalEffect(),
						maxTriggerCount: 3,
					},
					conditions: {
						damageDealtExceeds: 4,
					},
				})];

				const effect = { params };
				const context = createArbitraryContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expect(mockConditionalEffectConversionFunctionSpy).toHaveBeenCalledWith({
					id: arbitraryKnownConditionalId,
					params: '2&3&4',
					turnDuration: 5,
				}, context);
			});

			it('calls corresponding conditional effect conversion function when not defined via injection context', () => {
				const params = `${arbitraryKnownConditionalId},2&3&4,3,4,5`;
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						triggeredBuffs: getArbitraryBuffsForConditionalEffect(),
						maxTriggerCount: 3,
					},
					conditions: {
						damageDealtExceeds: 4,
					},
				})];

				getConditionalEffectToBuffMapping(true).set(arbitraryKnownConditionalId, mockConditionalEffectConversionFunctionSpy);

				const effect = { params };
				const context = createArbitraryContext();
				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
				expect(mockConditionalEffectConversionFunctionSpy).toHaveBeenCalledWith({
					id: arbitraryKnownConditionalId,
					params: '2&3&4',
					turnDuration: 5,
				}, context);
			});

			it('defaults numerical values to 0 if they are missing or non-number', () => {
				const params = `${arbitraryKnownConditionalId},params,not a number,not a number,not a number`;
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						triggeredBuffs: getArbitraryBuffsForConditionalEffect(),
						maxTriggerCount: 0,
					},
					conditions: {
						damageDealtExceeds: 0,
					},
				})];

				const effect = { params };
				const context = createArbitraryContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expect(mockConditionalEffectConversionFunctionSpy).toHaveBeenCalledWith({
					id: arbitraryKnownConditionalId,
					params: 'params',
					turnDuration: 0,
				}, context);
			});

			it('returns a no params buff when no parameters are given', () => {
				mockConditionalEffectConversionFunctionSpy.and.returnValue([]);
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext(), injectionContext });
			});

			it('returns a no params buff if no triggered buffs are found', () => {
				const params = `${arbitraryKnownConditionalId},2,3,4,5`;
				mockConditionalEffectConversionFunctionSpy.and.returnValue([]);
				expectNoParamsBuffWithEffectAndContext({ effect: { params }, context: createArbitraryContext(), injectionContext });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: `${arbitraryKnownConditionalId},2,3,456,5,789`,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: {
							triggeredBuffs: getArbitraryBuffsForConditionalEffect(),
							maxTriggerCount: 3,
						},
						conditions: {
							...arbitraryConditionValue,
							damageDealtExceeds: 456,
						},
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				injectionContext = { ...injectionContext, ...createDefaultInjectionContext() };
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 5] });
			});
		});

		describe('passive 81', () => {
			const expectedFlatFillBuffId = 'passive:81:bc fill after damage dealt conditional-flat';
			const expectedPercentFillBuffId = 'passive:81:bc fill after damage dealt conditional-percent';
			const expectedOriginalId = '81';
			const increaseBbGaugeKey = 'increase bb gauge';
			const damageThresholdKey = 'damage dealt threshold activation';

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedFlatFillBuffId, expectedPercentFillBuffId]);

			it('uses the params property when it exists', () => {
				const params = '100,200,2';
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatFillBuffId,
						value: 1,
						conditions: {
							damageDealtExceeds: 2,
						},
					}),
					baseBuffFactory({
						id: expectedPercentFillBuffId,
						value: 200,
						conditions: {
							damageDealtExceeds: 2,
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '100,200,3,4,5,6';
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatFillBuffId,
						value: 1,
						conditions: {
							damageDealtExceeds: 3,
						},
					}),
					baseBuffFactory({
						id: expectedPercentFillBuffId,
						value: 200,
						conditions: {
							damageDealtExceeds: 3,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_3: '4',
							param_4: '5',
							param_5: '6',
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = {
					[increaseBbGaugeKey]: 3,
					[damageThresholdKey]: 4,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedFlatFillBuffId,
					value: 3,
					conditions: {
						damageDealtExceeds: 4,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = {
					[increaseBbGaugeKey]: '5',
					[damageThresholdKey]: '6',
				};
				const expectedResult = [baseBuffFactory({
					id: expectedFlatFillBuffId,
					value: 5,
					conditions: {
						damageDealtExceeds: 6,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			describe('when values are missing', () => {
				it('only returns percent fill value if flat fill value is 0', () => {
					const params = '0,45600,789';
					const expectedResult = [baseBuffFactory({
						id: expectedPercentFillBuffId,
						value: 45600,
						conditions: {
							damageDealtExceeds: 789,
						},
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('only returns flat fill value if percent fill value is 0', () => {
					const params = '12300,0,789';
					const expectedResult = [baseBuffFactory({
						id: expectedFlatFillBuffId,
						value: 123,
						conditions: {
							damageDealtExceeds: 789,
						},
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for missing threshold value', () => {
					const params = '12300,45600,0';
					const expectedResult = [
						baseBuffFactory({
							id: expectedFlatFillBuffId,
							value: 123,
							conditions: {
								damageDealtExceeds: 0,
							},
						}),
						baseBuffFactory({
							id: expectedPercentFillBuffId,
							value: 45600,
							conditions: {
								damageDealtExceeds: 0,
							},
						}),
					];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for missing threshold value when params property does not exist', () => {
					const effect = {
						[increaseBbGaugeKey]: 456,
					};
					const expectedResult = [baseBuffFactory({
						id: expectedFlatFillBuffId,
						value: 456,
						conditions: {
							damageDealtExceeds: 0,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a no params buff if all effect properties are non-number values', () => {
					const effect = {
						[increaseBbGaugeKey]: 'not a number',
						[damageThresholdKey]: 'not a number',
					};
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('returns a no params buff if the effect params are non-number or missing', () => {
					const effect = { params: 'non-number' };
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '100,200,3,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatFillBuffId,
						sources: arbitrarySourceValue,
						value: 1,
						conditions: {
							...arbitraryConditionValue,
							damageDealtExceeds: 3,
						},
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: expectedPercentFillBuffId,
						sources: arbitrarySourceValue,
						value: 200,
						conditions: {
							...arbitraryConditionValue,
							damageDealtExceeds: 3,
						},
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 3] });
			});
		});

		describe('passive 82', () => {
			const expectedBuffId = 'passive:82:bc received conditional';
			const expectedOriginalId = '82';

			const arbitraryKnownConditionalId = 'arbitrary conditional id for passive 82';
			const getArbitraryBuffsForConditionalEffect = () => [{ arbitrary: 'conditional buff' }];
			let mockConditionalEffectConversionFunctionSpy;
			let injectionContext;

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);

				mockConditionalEffectConversionFunctionSpy = jasmine.createSpy('mockConditionalEffectConversionFunctionSpy');
				mockConditionalEffectConversionFunctionSpy.and.callFake(() => getArbitraryBuffsForConditionalEffect());
				injectionContext = { convertConditionalEffectToBuffs: mockConditionalEffectConversionFunctionSpy };
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = `${arbitraryKnownConditionalId},2,3,4,5`;
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						triggeredBuffs: getArbitraryBuffsForConditionalEffect(),
						maxTriggerCount: 3,
					},
					conditions: {
						bcReceivedExceeds: 4,
					},
				})];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext(), injectionContext);
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `${arbitraryKnownConditionalId},2,3,4,5,6,7,8`;
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: {
							triggeredBuffs: getArbitraryBuffsForConditionalEffect(),
							maxTriggerCount: 3,
						},
						conditions: {
							bcReceivedExceeds: 4,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						value: {
							param_5: '6',
							param_6: '7',
							param_7: '8',
						},
					}),
				];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext(), injectionContext);
				expect(result).toEqual(expectedResult);
			});

			it('calls corresponding conditional effect conversion function defined in injection context', () => {
				const params = `${arbitraryKnownConditionalId},2&3&4,3,4,5`;
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						triggeredBuffs: getArbitraryBuffsForConditionalEffect(),
						maxTriggerCount: 3,
					},
					conditions: {
						bcReceivedExceeds: 4,
					},
				})];

				const effect = { params };
				const context = createArbitraryContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expect(mockConditionalEffectConversionFunctionSpy).toHaveBeenCalledWith({
					id: arbitraryKnownConditionalId,
					params: '2&3&4',
					turnDuration: 5,
				}, context);
			});

			it('calls corresponding conditional effect conversion function when not defined via injection context', () => {
				const params = `${arbitraryKnownConditionalId},2&3&4,3,4,5`;
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						triggeredBuffs: getArbitraryBuffsForConditionalEffect(),
						maxTriggerCount: 3,
					},
					conditions: {
						bcReceivedExceeds: 4,
					},
				})];

				getConditionalEffectToBuffMapping(true).set(arbitraryKnownConditionalId, mockConditionalEffectConversionFunctionSpy);

				const effect = { params };
				const context = createArbitraryContext();
				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
				expect(mockConditionalEffectConversionFunctionSpy).toHaveBeenCalledWith({
					id: arbitraryKnownConditionalId,
					params: '2&3&4',
					turnDuration: 5,
				}, context);
			});

			it('defaults numerical values to 0 if they are missing or non-number', () => {
				const params = `${arbitraryKnownConditionalId},params,not a number,not a number,not a number`;
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						triggeredBuffs: getArbitraryBuffsForConditionalEffect(),
						maxTriggerCount: 0,
					},
					conditions: {
						bcReceivedExceeds: 0,
					},
				})];

				const effect = { params };
				const context = createArbitraryContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expect(mockConditionalEffectConversionFunctionSpy).toHaveBeenCalledWith({
					id: arbitraryKnownConditionalId,
					params: 'params',
					turnDuration: 0,
				}, context);
			});

			it('returns a no params buff when no parameters are given', () => {
				mockConditionalEffectConversionFunctionSpy.and.returnValue([]);
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext(), injectionContext });
			});

			it('returns a no params buff if no triggered buffs are found', () => {
				const params = `${arbitraryKnownConditionalId},2,3,4,5`;
				mockConditionalEffectConversionFunctionSpy.and.returnValue([]);
				expectNoParamsBuffWithEffectAndContext({ effect: { params }, context: createArbitraryContext(), injectionContext });
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: `${arbitraryKnownConditionalId},2,3,456,5,789`,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						value: {
							triggeredBuffs: getArbitraryBuffsForConditionalEffect(),
							maxTriggerCount: 3,
						},
						conditions: {
							...arbitraryConditionValue,
							bcReceivedExceeds: 456,
						},
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
					baseBuffFactory({
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					}, BUFF_TARGET_PROPS),
				];

				const context = createArbitraryContext();
				injectionContext = { ...injectionContext, ...createDefaultInjectionContext() };
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 5] });
			});
		});
	});
});
