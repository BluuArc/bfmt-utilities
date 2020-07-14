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
		const arbitraryConditionValue = { condtion: 'value' };
		const arbitraryTargetData = { targetData: 'data' };
		const arbitrarySourceValue = ['some source value'];
		const arbitraryUnknownValue = { unknownValue: 'some unknown value' };

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
		const testFunctionExistence = (mapKey) => {
			it('has a function on the map', () => {
				const map = getPassiveEffectToBuffMapping();
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

		describe('passive 1', () => {
			const STAT_PARAMS_ORDER = ['atk', 'def', 'rec', 'crit', 'hp'];
			const expectedOriginalId = '1';

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get('1');
			});

			testFunctionExistence('1');

			expectValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `passive:1:${stat}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5';
				const splitParams = params.split(',');
				const sources = createExpectedSourcesForArbitraryContext();
				const targetData = createSelfSingleTargetData();
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return {
						id: `passive:1:${stat}`,
						originalId: expectedOriginalId,
						sources,
						value: +(splitParams[index]),
						conditions: {},
						...targetData,
					};
				});

				const effect = { params };
				const context = createArbitraryContext();
				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,6,7,8';
				const splitParams = params.split(',');
				const sources = createExpectedSourcesForArbitraryContext();
				const targetData = createSelfSingleTargetData();
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return {
						id: `passive:1:${stat}`,
						originalId: expectedOriginalId,
						sources,
						value: +(splitParams[index]),
						conditions: {},
						...targetData,
					};
				}).concat([{
					id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
					originalId: expectedOriginalId,
					sources,
					value: {
						param_5: '6',
						param_6: '7',
						param_7: '8',
					},
					conditions: {},
					...targetData,
				}]);

				const effect = { params };
				const context = createArbitraryContext();
				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('falls back to stat-specific properties when the params property does not exist', () => {
				const mockValues = [6, 7, 8, 9, 10];
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat, index) => {
					acc[`${stat}% buff`] = mockValues[index];
					return acc;
				}, {});

				const sources = createExpectedSourcesForArbitraryContext();
				const targetData = createSelfSingleTargetData();
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return {
						id: `passive:1:${stat}`,
						originalId: expectedOriginalId,
						sources,
						value: mockValues[index],
						conditions: {},
						...targetData,
					};
				});

				const context = createArbitraryContext();
				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			STAT_PARAMS_ORDER.forEach((statCase) => {
				it(`returns only value for ${statCase} if it is non-zero and other stats are zero`, () => {
					const params = STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0').join(',');
					const sources = createExpectedSourcesForArbitraryContext();
					const targetData = createSelfSingleTargetData();
					const expectedResult = [
						{
							id: `passive:1:${statCase}`,
							originalId: expectedOriginalId,
							sources,
							value: 123,
							conditions: {},
							...targetData,
						},
					];

					const effect = { params };
					const context = createArbitraryContext();
					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,0,0,0,456,789',
				};
				const expectedResult = [
					{
						id: 'passive:1:hp',
						originalId: expectedOriginalId,
						sources: arbitrarySourceValue,
						value: 456,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					},
					{
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						originalId: expectedOriginalId,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					},
				];
				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 5] });
			});
		});

		describe('passive 2', () => {
			const STAT_PARAMS_ORDER = ['atk', 'def', 'rec', 'crit', 'hp'];
			const ELEMENT_MAPPING = {
				1: UnitElement.Fire,
				2: UnitElement.Water,
				3: UnitElement.Earth,
				4: UnitElement.Thunder,
				5: UnitElement.Light,
				6: UnitElement.Dark,
				X: 'omniParadigm',
			};
			const expectedOriginalId = '2';

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get('2');
			});

			testFunctionExistence('2');

			expectValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `passive:2:${stat}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6,7';
				const splitParams = params.split(',');
				const sources = createExpectedSourcesForArbitraryContext();
				const targetData = createSelfSingleTargetData();
				const expectedResult = [UnitElement.Fire, UnitElement.Water].map((element) => {
					return STAT_PARAMS_ORDER.map((stat, index) => {
						return {
							id: `passive:2:${stat}`,
							originalId: expectedOriginalId,
							sources,
							value: +(splitParams[index + 2]),
							conditions: {
								targetElements: [element],
							},
							...targetData,
						};
					});
				}).reduce((acc, val) => acc.concat(val), []);

				const effect = { params };
				const context = createArbitraryContext();
				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '5,6,3,4,5,6,7,8,9,10';
				const splitParams = params.split(',');
				const sources = createExpectedSourcesForArbitraryContext();
				const targetData = createSelfSingleTargetData();
				const expectedResult = [UnitElement.Light, UnitElement.Dark].map((element) => {
					return STAT_PARAMS_ORDER.map((stat, index) => {
						return {
							id: `passive:2:${stat}`,
							originalId: expectedOriginalId,
							sources,
							value: +(splitParams[index + 2]),
							conditions: {
								targetElements: [element],
							},
							...targetData,
						};
					});
				}).reduce((acc, val) => acc.concat(val), [])
					.concat([{
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						originalId: expectedOriginalId,
						sources,
						value: {
							param_7: '8',
							param_8: '9',
							param_9: '10',
						},
						conditions: {},
						...targetData,
					}]);

				const effect = { params };
				const context = createArbitraryContext();
				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when the params property does not exist', () => {
				const mockValues = [8, 9, 10, 11, 12];
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat, index) => {
					acc[`${stat}% buff`] = mockValues[index];
					return acc;
				}, {});
				effect['elements buffed'] = ['element1', 'element2', 'element3']; // elements are taken at face value

				const sources = createExpectedSourcesForArbitraryContext();
				const targetData = createSelfSingleTargetData();
				const expectedResult = ['element1', 'element2', 'element3'].map((element) => {
					return STAT_PARAMS_ORDER.map((stat, index) => {
						return {
							id: `passive:2:${stat}`,
							originalId: expectedOriginalId,
							sources,
							value: mockValues[index],
							conditions: {
								targetElements: [element],
							},
							...targetData,
						};
					});
				}).reduce((acc, val) => acc.concat(val), []);

				const context = createArbitraryContext();
				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			STAT_PARAMS_ORDER.forEach((statCase) => {
				Object.entries(ELEMENT_MAPPING).forEach(([elementKey, elementValue]) => {
					it(`returns only value for ${statCase} and ${elementValue} if it is non-zero and other stats are zero and only one element is specified`, () => {
						const params = [elementKey, '0', ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0')].join(',');

						const sources = createExpectedSourcesForArbitraryContext();
						const targetData = createSelfSingleTargetData();

						const expectedResult = [
							{
								id: `passive:2:${statCase}`,
								originalId: expectedOriginalId,
								sources,
								value: 123,
								conditions: {
									targetElements: [elementValue],
								},
								...targetData,
							},
						];

						const effect = { params };
						const context = createArbitraryContext();
						const result = mappingFunction(effect, context);
						expect(result).toEqual(expectedResult);
					});
				});

				it(`converts element values with no mapping to "unknown" and the only non-zero stat is ${statCase}`, () => {
					const params = ['123', '456', ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0')].join(',');

					const sources = createExpectedSourcesForArbitraryContext();
					const targetData = createSelfSingleTargetData();

					const expectedResult = [
						{
							id: `passive:2:${statCase}`,
							originalId: expectedOriginalId,
							sources,
							value: 123,
							conditions: {
								targetElements: ['unknown'],
							},
							...targetData,
						},
						{
							id: `passive:2:${statCase}`,
							originalId: expectedOriginalId,
							sources,
							value: 123,
							conditions: {
								targetElements: ['unknown'],
							},
							...targetData,
						},
					];

					const effect = { params };
					const context = createArbitraryContext();
					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});

				it(`outputs stat buffs when no elements are given and the only non-zero stat is ${statCase}`, () => {
					const params = ['0', '0', ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0')].join(',');

					const sources = createExpectedSourcesForArbitraryContext();
					const targetData = createSelfSingleTargetData();

					const expectedResult = [
						{
							id: `passive:2:${statCase}`,
							originalId: expectedOriginalId,
							sources,
							value: 123,
							conditions: {
								targetElements: ['unknown'],
							},
							...targetData,
						},
					];

					const effect = { params };
					const context = createArbitraryContext();
					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});
			});

			it('outputs stat buffs when no elements are given', () => {
				const params = ['0', '0', ...STAT_PARAMS_ORDER.map((stat, index) => index + 1)].join(',');

				const sources = createExpectedSourcesForArbitraryContext();
				const targetData = createSelfSingleTargetData();

				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return {
						id: `passive:2:${stat}`,
						originalId: expectedOriginalId,
						sources,
						value: index + 1,
						conditions: {
							targetElements: ['unknown'],
						},
						...targetData,
					};
				});

				const effect = { params };
				const context = createArbitraryContext();
				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,0,0,0,0,0,456,789',
				};
				const expectedResult = [
					{
						id: 'passive:2:hp',
						originalId: expectedOriginalId,
						sources: arbitrarySourceValue,
						value: 456,
						conditions: {
							...arbitraryConditionValue,
							targetElements: ['unknown'],
						},
						...arbitraryTargetData,
					},
					{
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						originalId: expectedOriginalId,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					},
				];
				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['789']), 7] });
			});
		});

		describe('passive 3', () => {
			const STAT_PARAMS_ORDER = ['atk', 'def', 'rec', 'crit', 'hp'];
			const UNIT_TYPE_MAPPING = {
				1: UnitType.Lord,
				2: UnitType.Anima,
				3: UnitType.Breaker,
				4: UnitType.Guardian,
				5: UnitType.Oracle,
				6: UnitType.Rex,
			};
			const expectedOriginalId = '3';

			beforeEach(() => {
				mappingFunction = getPassiveEffectToBuffMapping().get('3');
			});

			testFunctionExistence('3');

			expectValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `passive:3:${stat}`));

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6';
				const splitParams = params.split(',');
				const sources = createExpectedSourcesForArbitraryContext();
				const targetData = createSelfSingleTargetData();
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return {
						id: `passive:3:${stat}`,
						originalId: expectedOriginalId,
						sources,
						value: +(splitParams[index + 1]),
						conditions: {
							targetUnitType: UnitType.Lord,
						},
						...targetData,
					};
				});

				const effect = { params };
				const context = createArbitraryContext();
				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '5,2,3,4,5,6,7,8,9';
				const splitParams = params.split(',');
				const sources = createExpectedSourcesForArbitraryContext();
				const targetData = createSelfSingleTargetData();
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return {
						id: `passive:3:${stat}`,
						originalId: expectedOriginalId,
						sources,
						value: +(splitParams[index + 1]),
						conditions: {
							targetUnitType: UnitType.Oracle,
						},
						...targetData,
					};
				}).concat([{
					id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
					originalId: expectedOriginalId,
					sources,
					value: {
						param_6: '7',
						param_7: '8',
						param_8: '9',
					},
					conditions: {},
					...targetData,
				}]);

				const effect = { params };
				const context = createArbitraryContext();
				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when the params property does not exist', () => {
				const mockValues = [8, 9, 10, 11, 12];
				const effect = STAT_PARAMS_ORDER.reduce((acc, stat, index) => {
					acc[`${stat}% buff`] = mockValues[index];
					return acc;
				}, {});
				effect['unit type buffed'] = 'arbitrary type'; // types are taken at face value

				const sources = createExpectedSourcesForArbitraryContext();
				const targetData = createSelfSingleTargetData();
				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return {
						id: `passive:3:${stat}`,
						originalId: expectedOriginalId,
						sources,
						value: mockValues[index],
						conditions: {
							targetUnitType: 'arbitrary type',
						},
						...targetData,
					};
				});

				const context = createArbitraryContext();
				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			STAT_PARAMS_ORDER.forEach((statCase) => {
				Object.entries(UNIT_TYPE_MAPPING).forEach(([typeKey, typeValue]) => {
					it(`returns only value for ${statCase} and ${typeValue} if it is non-zero and other stats are zero`, () => {
						const params = [typeKey, ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0')].join(',');

						const sources = createExpectedSourcesForArbitraryContext();
						const targetData = createSelfSingleTargetData();

						const expectedResult = [
							{
								id: `passive:3:${statCase}`,
								originalId: expectedOriginalId,
								sources,
								value: 123,
								conditions: {
									targetUnitType: typeValue,
								},
								...targetData,
							},
						];

						const effect = { params };
						const context = createArbitraryContext();
						const result = mappingFunction(effect, context);
						expect(result).toEqual(expectedResult);
					});
				});

				it(`converts unit type values with no mapping to "unknown" and the only non-zero stat is ${statCase}`, () => {
					const params = ['123', ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0')].join(',');

					const sources = createExpectedSourcesForArbitraryContext();
					const targetData = createSelfSingleTargetData();

					const expectedResult = [
						{
							id: `passive:3:${statCase}`,
							originalId: expectedOriginalId,
							sources,
							value: 123,
							conditions: {
								targetUnitType: 'unknown',
							},
							...targetData,
						},
					];

					const effect = { params };
					const context = createArbitraryContext();
					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});

				it(`outputs stat buffs when no unit types are specified and the only non-zero stat is ${statCase}`, () => {
					const params = ['0', ...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0')].join(',');

					const sources = createExpectedSourcesForArbitraryContext();
					const targetData = createSelfSingleTargetData();

					const expectedResult = [
						{
							id: `passive:3:${statCase}`,
							originalId: expectedOriginalId,
							sources,
							value: 123,
							conditions: {
								targetUnitType: 'unknown',
							},
							...targetData,
						},
					];

					const effect = { params };
					const context = createArbitraryContext();
					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});
			});

			it('outputs stat buffs when no unit types are given', () => {
				const params = ['0', ...STAT_PARAMS_ORDER.map((stat, index) => index + 1)].join(',');

				const sources = createExpectedSourcesForArbitraryContext();
				const targetData = createSelfSingleTargetData();

				const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
					return {
						id: `passive:3:${stat}`,
						originalId: expectedOriginalId,
						sources,
						value: index + 1,
						conditions: {
							targetUnitType: 'unknown',
						},
						...targetData,
					};
				});

				const effect = { params };
				const context = createArbitraryContext();
				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('uses processExtraSkillConditions, getPassiveTargetData, createSourcesfromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,0,0,0,0,456,789',
				};
				const expectedResult = [
					{
						id: 'passive:3:hp',
						originalId: expectedOriginalId,
						sources: arbitrarySourceValue,
						value: 456,
						conditions: {
							...arbitraryConditionValue,
							targetUnitType: 'unknown',
						},
						...arbitraryTargetData,
					},
					{
						id: BuffId.UNKNOWN_PASSIVE_BUFF_PARAMS,
						originalId: expectedOriginalId,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						conditions: arbitraryConditionValue,
						...arbitraryTargetData,
					},
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
