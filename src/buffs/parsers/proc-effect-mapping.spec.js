const { getProcEffectToBuffMapping } = require('./proc-effect-mapping');
const { BuffId } = require('./buff-types');

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
		const arbitraryTargetData = { targetData: 'data' };
		const arbitrarySourceValue = ['some source value'];
		const arbitraryUnknownValue = { unknownValue: 'some unknown value' };
		const arbitraryHitCount = 123;
		const arbitraryDamageDistribution = 456;

		const HIT_DMG_DISTRIBUTION_TOTAL_KEY = 'hit dmg% distribution (total)';

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
				mappingFunction = getProcEffectToBuffMapping().get('1');
			});

			testFunctionExistence('1');

			expectValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = '1,2,3,4,5,6';
				const splitParams = params.split(',');
				const effect = {
					params,
					...createArbitraryTargetDataForEffect(),
				};
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
				const expectedResult = [{
					id: expectedBuffId,
					originalId: expectedOriginalId,
					sources: createExpectedSourcesForArbitraryContext(),
					value: {
						...expectedValuesForParams,
						hits: arbitraryHitCount,
						distribution: arbitraryDamageDistribution,
					},
					...createExpectedTargetDataForBuffFromArbitraryTargetDataInEffect(),
				}];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = '1,2,3,4,5,6,7,8,9';
				const splitParams = params.split(',');
				const effect = {
					params,
					...createArbitraryTargetDataForEffect(),
				};
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
					{
						id: expectedBuffId,
						originalId: expectedOriginalId,
						sources: createExpectedSourcesForArbitraryContext(),
						value: {
							...expectedValuesForParams,
							hits: arbitraryHitCount,
							distribution: arbitraryDamageDistribution,
						},
						...createExpectedTargetDataForBuffFromArbitraryTargetDataInEffect(),
					},
					{
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						originalId: expectedOriginalId,
						sources: createExpectedSourcesForArbitraryContext(),
						value: {
							param_6: '7',
							param_7: '8',
							param_8: '9',
						},
						...createExpectedTargetDataForBuffFromArbitraryTargetDataInEffect(),
					},
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
				const effect = {
					...valuesInEffect,
					...createArbitraryTargetDataForEffect(),
				};
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
				const expectedResult = [{
					id: expectedBuffId,
					originalId: expectedOriginalId,
					sources: createExpectedSourcesForArbitraryContext(),
					value: {
						...expectedValuesForParams,
						hits: arbitraryHitCount,
						distribution: arbitraryDamageDistribution,
					},
					...createExpectedTargetDataForBuffFromArbitraryTargetDataInEffect(),
				}];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			describe('for missing parts of context.damageFrames', () => {
				it('defaults to 0 for hits and distribution if context.damageFrames does not exist', () => {
					const effect = createArbitraryTargetDataForEffect();
					const context = createArbitraryContext();
					const expectedResult = [{
						id: expectedBuffId,
						originalId: expectedOriginalId,
						sources: createExpectedSourcesForArbitraryContext(),
						value: {
							hits: 0,
							distribution: 0,
						},
						...createExpectedTargetDataForBuffFromArbitraryTargetDataInEffect(),
					}];
					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for hits if context.damageFrames.hits does not exist', () => {
					const effect = createArbitraryTargetDataForEffect();
					const context = createArbitraryContext({
						damageFrames: {
							[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: arbitraryDamageDistribution,
						},
					});
					const expectedResult = [{
						id: expectedBuffId,
						originalId: expectedOriginalId,
						sources: createExpectedSourcesForArbitraryContext(),
						value: {
							hits: 0,
							distribution: arbitraryDamageDistribution,
						},
						...createExpectedTargetDataForBuffFromArbitraryTargetDataInEffect(),
					}];
					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for distribution if context.damageFrames["hit dmg% distribution (total)"] does not exist', () => {
					const effect = createArbitraryTargetDataForEffect();
					const context = createArbitraryContext({
						damageFrames: {
							hits: arbitraryHitCount,
						},
					});
					const expectedResult = [{
						id: expectedBuffId,
						originalId: expectedOriginalId,
						sources: createExpectedSourcesForArbitraryContext(),
						value: {
							hits: arbitraryHitCount,
							distribution: 0,
						},
						...createExpectedTargetDataForBuffFromArbitraryTargetDataInEffect(),
					}];
					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});
			});

			PARAMS_ORDER.forEach((paramCase) => {
				it(`returns only value for ${paramCase} if it is non-zero and other stats are zero`, () => {
					const params = PARAMS_ORDER.map((param) => param === paramCase ? '789' : '0').join(',');
					const effect = {
						params,
						...createArbitraryTargetDataForEffect(),
					};
					const expectedResult = [{
						id: expectedBuffId,
						originalId: expectedOriginalId,
						sources: createExpectedSourcesForArbitraryContext(),
						value: {
							[paramCase]: 789,
							hits: 0,
							distribution: 0,
						},
						...createExpectedTargetDataForBuffFromArbitraryTargetDataInEffect(),
					}];
					const context = createArbitraryContext();

					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0,0,0,0,0,0,123',
				};
				const context = createArbitraryContext();
				const expectedResult = [
					{
						id: expectedBuffId,
						originalId: expectedOriginalId,
						sources: arbitrarySourceValue,
						value: { hits: 0, distribution: 0 },
						...arbitraryTargetData,
					},
					{
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						originalId: expectedOriginalId,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						...arbitraryTargetData,
					},
				];
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
				mappingFunction = getProcEffectToBuffMapping().get('2');
			});

			testFunctionExistence('2');
			expectValidBuffIds([expectedBuffId]);

			it('uses the params property when it exists', () => {
				const params = `1,2,${arbitraryRecX},${arbitraryRecY}`;
				const effect = {
					params,
					...createArbitraryTargetDataForEffect(),
				};
				const context = createArbitraryContext();
				const expectedResult = [{
					id: expectedBuffId,
					originalId: expectedOriginalId,
					sources: createExpectedSourcesForArbitraryContext(),
					value: {
						healLow: 1,
						healHigh: 2,
						'healerRec%': expectedRecAddedForArbitraryValues,
					},
					...createExpectedTargetDataForBuffFromArbitraryTargetDataInEffect(),
				}];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const params = `1,2,${arbitraryRecX},${arbitraryRecY},5,6,7`;
				const effect = {
					params,
					...createArbitraryTargetDataForEffect(),
				};
				const context = createArbitraryContext();
				const expectedResult = [
					{
						id: expectedBuffId,
						originalId: expectedOriginalId,
						sources: createExpectedSourcesForArbitraryContext(),
						value: {
							healLow: 1,
							healHigh: 2,
							'healerRec%': expectedRecAddedForArbitraryValues,
						},
						...createExpectedTargetDataForBuffFromArbitraryTargetDataInEffect(),
					},
					{
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						originalId: expectedOriginalId,
						sources: createExpectedSourcesForArbitraryContext(),
						value: {
							param_4: '5',
							param_5: '6',
							param_6: '7',
						},
						...createExpectedTargetDataForBuffFromArbitraryTargetDataInEffect(),
					},
				];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('falls back to effect properties when params property does not exist', () => {
				const effect = {
					'heal low': 3,
					'heal high': 4,
					'rec added% (from healer)': 5,
					...createArbitraryTargetDataForEffect(),
				};
				const context = createArbitraryContext();
				const expectedResult = [{
					id: expectedBuffId,
					originalId: expectedOriginalId,
					sources: createExpectedSourcesForArbitraryContext(),
					value: {
						healLow: 3,
						healHigh: 4,
						'healerRec%': 5,
					},
					...createExpectedTargetDataForBuffFromArbitraryTargetDataInEffect(),
				}];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('converts effect properties to numbers when params property does not exist', () => {
				const effect = {
					'heal low': '6',
					'heal high': '7',
					'rec added% (from healer)': '8',
					...createArbitraryTargetDataForEffect(),
				};
				const context = createArbitraryContext();
				const expectedResult = [{
					id: expectedBuffId,
					originalId: expectedOriginalId,
					sources: createExpectedSourcesForArbitraryContext(),
					value: {
						healLow: 6,
						healHigh: 7,
						'healerRec%': 8,
					},
					...createExpectedTargetDataForBuffFromArbitraryTargetDataInEffect(),
				}];

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
						const effect = {
							...valuesInEffect,
							...createArbitraryTargetDataForEffect(),
						};
						const context = createArbitraryContext();
						const expectedValues = Object.entries(effectPropToResultPropMapping)
							.reduce((acc, [localEffectProp, resultProp]) => {
								acc[resultProp] = localEffectProp === effectProp ? 0 : 123;
								return acc;
							}, {});
						const expectedResult = [{
							id: expectedBuffId,
							originalId: expectedOriginalId,
							sources: createExpectedSourcesForArbitraryContext(),
							value: expectedValues,
							...createExpectedTargetDataForBuffFromArbitraryTargetDataInEffect(),
						}];

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
					const effect = {
						...valuesInEffect,
						...createArbitraryTargetDataForEffect(),
					};
					const context = createArbitraryContext();
					const expectedResult = [{
						id: expectedBuffId,
						originalId: expectedOriginalId,
						sources: createExpectedSourcesForArbitraryContext(),
						value: {
							healLow: 0,
							healHigh: 0,
							'healerRec%': 0,
						},
						...createExpectedTargetDataForBuffFromArbitraryTargetDataInEffect(),
					}];

					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});

				it('defaults values for effect params to 0 if they are non-number or missing', () => {
					const effect = {
						params: 'non-number',
						...createArbitraryTargetDataForEffect(),
					};
					const context = createArbitraryContext();
					const expectedResult = [{
						id: expectedBuffId,
						originalId: expectedOriginalId,
						sources: createExpectedSourcesForArbitraryContext(),
						value: {
							healLow: 0,
							healHigh: 0,
							'healerRec%': 10,
						},
						...createExpectedTargetDataForBuffFromArbitraryTargetDataInEffect(),
					}];

					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});
			});

			it('uses getProcTargetData, createSourcesFromContext, and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: `0,0,${arbitraryRecX},${arbitraryRecY},123`,
				};
				const context = createArbitraryContext();
				const expectedResult = [
					{
						id: expectedBuffId,
						originalId: expectedOriginalId,
						sources: arbitrarySourceValue,
						value: { healHigh: 0, healLow: 0, 'healerRec%': expectedRecAddedForArbitraryValues },
						...arbitraryTargetData,
					},
					{
						id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
						originalId: expectedOriginalId,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
						...arbitraryTargetData,
					},
				];
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['123']), 4] });
			});
		});
	});
});
