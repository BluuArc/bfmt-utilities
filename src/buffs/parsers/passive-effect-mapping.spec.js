const { getPassiveEffectToBuffMapping } = require('./passive-effect-mapping');
const { TargetType, TargetArea, UnitElement, UnitType } = require('../../datamine-types');
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

		const BUFF_TARGET_PROPS = ['targetType', 'targetArea'];
		const STAT_PARAMS_ORDER = ['atk', 'def', 'rec', 'crit', 'hp'];
		const AILMENTS_ORDER = ['poison', 'weak', 'sick', 'injury', 'curse', 'paralysis'];

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
					value: 123,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const effect = { params: '123,2,3,4' };
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						value: 123,
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

			it('returns no values if parsed value from params is zero', () => {
				const effect = { params: '0' };
				const expectedResult = [];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '2,789',
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 1] });
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

				it(`returns no mitigation value for ${knownElementValue} when not given params property and value is zero`, () => {
					const effect = { [`${knownElementValue} resist%`]: 0 };
					const expectedResult = [];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
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

			it('returns no mitigation value if parsed mitigation value from params is zero', () => {
				const params = '3,0';
				const expectedResult = [];

				const effect = { params };
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns no mitigation value if no elemental value is found in effect without params', () => {
				const effect = { 'fake-element resist%': 123 };
				const expectedResult = [];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
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
			const DROP_TYPE_ORDER = ['bc', 'hc', 'item', 'zel', 'karma'];

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

			it('falls back to stat-specific properties when the params property does not exist', () => {
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
	});
});
