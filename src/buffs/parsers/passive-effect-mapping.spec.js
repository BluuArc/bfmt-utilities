const { getPassiveEffectToBuffMapping } = require('./passive-effect-mapping');
const { TargetType, TargetArea, UnitElement, UnitType, UnitGender } = require('../../datamine-types');
const { BuffId } = require('./buff-types');

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

			it('returns a no parmas buff if parsed value from params is zero', () => {
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
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `passive:2:${stat}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6,7';
				const splitParams = params.split(',');
				const expectedResult = [UnitElement.Fire, UnitElement.Water].map((element) => {
					return STAT_PARAMS_ORDER.map((stat, index) => {
						return baseBuffFactory({
							id: `passive:2:${stat}`,
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
							id: `passive:2:${stat}`,
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
							id: `passive:2:${stat}`,
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
							id: `passive:2:${statCase}`,
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
							id: `passive:2:${statCase}`,
							value: 123,
							conditions: {
								targetElements: ['unknown'],
							},
						}),
						baseBuffFactory({
							id: `passive:2:${statCase}`,
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
						id: `passive:2:${statCase}`,
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
						id: `passive:2:${stat}`,
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
						id: `passive:2:${stat}`,
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
						id: 'passive:2:hp',
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
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `passive:3:${stat}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:3:${stat}`,
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
						id: `passive:3:${stat}`,
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
						id: `passive:3:${stat}`,
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
							id: `passive:3:${statCase}`,
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
						id: `passive:3:${statCase}`,
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
						id: `passive:3:${statCase}`,
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
						id: `passive:3:${stat}`,
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
						id: 'passive:3:hp',
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
			testValidBuffIds(AILMENTS_ORDER.map((ailment) => `passive:4:${ailment}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6';
				const splitParams = params.split(',');
				const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
					return baseBuffFactory({
						id: `passive:4:${ailment}`,
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
						id: `passive:4:${ailment}`,
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
						id: `passive:4:${ailment}`,
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
						id: `passive:4:${ailmentCase}`,
						value: 123,
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
						id: 'passive:4:paralysis',
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
			testValidBuffIds(Object.values(ELEMENT_MAPPING).concat(['unknown']).map((elem) => `passive:5:${elem}`));

			it('uses the params property when it exists', () => {
				const params = '1,2';
				const expectedResult = [baseBuffFactory({
					id: 'passive:5:fire',
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
						id: 'passive:5:dark',
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
					id: 'passive:5:water',
					value: 5,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			Object.entries(ELEMENT_MAPPING).forEach(([knownElementKey, knownElementValue]) => {
				it(`parses raw value for ${knownElementValue} in params property`, () => {
					const params = `${knownElementKey},123`;
					const expectedResult = [baseBuffFactory({
						id: `passive:5:${knownElementValue}`,
						value: 123,
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`parses value for ${knownElementValue} when not given params property and value is non-zero`, () => {
					const effect = { [`${knownElementValue} resist%`]: 456 };
					const expectedResult = [baseBuffFactory({
						id: `passive:5:${knownElementValue}`,
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
					id: 'passive:5:unknown',
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
						id: 'passive:5:light',
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
				expectedBuffId: 'passive:8',
				effectKey: 'dmg% mitigation',
			});
		});

		describe('passive 9', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '9',
				expectedBuffId: 'passive:9',
				effectKey: 'bc fill per turn',
			});
		});

		describe('passive 10', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '10',
				expectedBuffId: 'passive:10',
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
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `passive:11:${stat}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,1';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:11:${stat}`,
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
						id: `passive:11:${stat}`,
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
						id: `passive:11:${stat}`,
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
							id: `passive:11:${statCase}`,
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
							id: `passive:11:${statCase}`,
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
						id: 'passive:11:crit',
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
			testValidBuffIds(DROP_TYPE_ORDER.map((dropType) => `passive:12:${dropType}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6,1';
				const splitParams = params.split(',');
				const expectedResult = DROP_TYPE_ORDER.map((dropType, index) => {
					return baseBuffFactory({
						id: `passive:12:${dropType}`,
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
						id: `passive:12:${dropType}`,
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
						id: `passive:12:${dropType}`,
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
							id: `passive:12:${dropTypeCase}`,
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
							id: `passive:12:${dropTypeCase}`,
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
						id: 'passive:12:karma',
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
				expectedBuffId: 'passive:13',
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
			const expectedBuffId = 'passive:14';
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
				expectedBuffId: 'passive:15',
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
			const expectedBuffId = 'passive:16';
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
				expectedBuffId: 'passive:17',
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
			testValidBuffIds(DROP_TYPE_ORDER.map((dropType) => `passive:19:${dropType}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5';
				const splitParams = params.split(',');
				const expectedResult = DROP_TYPE_ORDER.map((dropType, index) => {
					return baseBuffFactory({
						id: `passive:19:${dropType}`,
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
						id: `passive:19:${dropType}`,
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
						id: `passive:19:${dropType}`,
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
						id: `passive:19:${dropTypeCase}`,
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
						id: `passive:19:${dropTypeCase}`,
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
						id: 'passive:19:karma',
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
			testValidBuffIds(Object.values(AILMENT_MAPPING).concat(['unknown']).map((a) => `passive:20:${a}`));

			it('uses the params property when it exists', () => {
				const params = '1,2';
				const expectedResult = [baseBuffFactory({
					id: 'passive:20:poison',
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
						id: 'passive:20:sick',
						value: 4,
					}),
					baseBuffFactory({
						id: 'passive:20:curse',
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
						id: 'passive:20:injury',
						value: 5,
					}),
					baseBuffFactory({
						id: 'passive:20:paralysis',
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
					id: 'passive:20:paralysis',
					value: 123,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			Object.entries(AILMENT_MAPPING).forEach(([ailmentKey, ailmentName]) => {
				it(`returns an entry for ${ailmentName} when it is present in the params property`, () => {
					const params = `${ailmentKey},123`;
					const expectedResult = [baseBuffFactory({
						id: `passive:20:${ailmentName}`,
						value: 123,
					})];

					const effect = { params };
					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`returns an entry for ${ailmentName} when it is present in the effect and no params property does not exist`, () => {
					const effect = { [AILMENT_EFFECT_KEY_MAPPING[ailmentName]]: 456 };
					const expectedResult = [baseBuffFactory({
						id: `passive:20:${ailmentName}`,
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
						id: `passive:20:${ailment}`,
						value: index + 1,
					}));

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('parses params outside of the known ailments as unknown', () => {
				const params = '123,456';
				const expectedResult = [baseBuffFactory({
					id: 'passive:20:unknown',
					value: 456,
				})];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns values when no ailment is specified but chance is non-zero', () => {
				const params = '0,123';
				const expectedResult = [baseBuffFactory({
					id: 'passive:20:unknown',
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
						id: 'passive:20:poison',
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
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `passive:21:${stat}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:21:${stat}`,
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
						id: `passive:21:${stat}`,
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
						id: `passive:21:${stat}`,
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
						id: `passive:21:${statCase}`,
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
						id: `passive:21:${statCase}`,
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
						id: 'passive:21:crit',
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
			const expectedBuffId = 'passive:23';
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
				expectedBuffId: 'passive:24',
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
				expectedBuffId: 'passive:25',
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
				expectedBuffId: 'passive:26',
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
				expectedBuffId: 'passive:27',
				effectKey: 'target% chance',
			});
		});

		describe('passive 28', () => {
			const expectedOriginalId = '28';
			const expectedBuffId = 'passive:28';
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
						id: 'passive:28',
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
						id: 'passive:28',
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
						id: 'passive:28',
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
				expectedBuffId: 'passive:29',
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
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `passive:30:${stat}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,1';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:30:${stat}`,
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
						id: `passive:30:${stat}`,
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
						id: `passive:30:${stat}`,
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
							id: `passive:30:${statCase}`,
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
							id: `passive:30:${statCase}`,
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
						id: 'passive:30:crit',
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
			testValidBuffIds(allParamTypes.map((paramType) => `passive:31:${paramType}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6';
				const splitParams = params.split(',');
				const expectedResult = allParamTypes.map((paramType, index) => {
					return baseBuffFactory({
						id: `passive:31:${paramType}`,
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
						id: `passive:31:${paramType}`,
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
						id: `passive:31:${paramType}`,
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
						id: `passive:31:${paramTypeCase}`,
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
						id: `passive:31:${paramTypeCase}`,
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
						id: 'passive:31:karma',
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
				expectedBuffId: 'passive:32',
				effectKey: 'bb gauge fill rate%',
			});
		});

		describe('passive 33', () => {
			const expectedBuffId = 'passive:33';
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
				expectedBuffId: 'passive:34',
				effectKey: 'crit multiplier%',
				getExpectedValueFromParam: (param) => (+param) * 100,
			});
		});

		describe('passive 35', () => {
			testPassiveWithNumericalValueRangeAndChance({
				expectedOriginalId: '35',
				expectedBuffId: 'passive:35',
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
			const expectedBuffId = 'passive:36';
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
			const expectedBuffId = 'passive:37';
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

				it('returns a no params buff if all effect properties are non-number values', () => {
					const effect = Object.keys(effectPropToResultPropMapping)
						.reduce((acc, prop) => {
							acc[prop] = 'not a number';
							return acc;
						}, {});
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('returns a no params buff if they effect params are non-number or missing', () => {
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
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `passive:40:${stat}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:40:${stat}`,
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
						id: `passive:40:${stat}`,
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
						id: `passive:40:${stat}`,
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
							id: `passive:40:${statCase}`,
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
							id: `passive:40:${statCase}`,
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
						id: `passive:40:${statCase}`,
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
						id: `passive:40:${statCase}`,
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
					id: 'passive:40:def',
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
						id: 'passive:40:rec',
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
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `passive:41:${stat}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:41:${stat}`,
						value: +(splitParams[index + 1]),
						conditions: {
							minumumUniqueElements: 1,
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
						id: `passive:41:${stat}`,
						value: +(splitParams[index + 1]),
						conditions: {
							minumumUniqueElements: 5,
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
						id: `passive:41:${stat}`,
						value: mockValues[index],
						conditions: {
							minumumUniqueElements: 3,
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
						id: `passive:41:${statCase}`,
						value: 123,
						conditions: {
							minumumUniqueElements: 456,
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
						id: 'passive:41:hp',
						sources: arbitrarySourceValue,
						value: 456,
						conditions: {
							...arbitraryConditionValue,
							minumumUniqueElements: 0,
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
			testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `passive:42:${stat}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6';
				const splitParams = params.split(',');
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return baseBuffFactory({
						id: `passive:42:${stat}`,
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
						id: `passive:42:${stat}`,
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
						id: `passive:42:${stat}`,
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
							id: `passive:42:${statCase}`,
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
						id: `passive:42:${statCase}`,
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
						id: `passive:42:${statCase}`,
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
						id: `passive:42:${stat}`,
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
						id: 'passive:42:hp',
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
	});
});
