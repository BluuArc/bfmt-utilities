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
		const arbitraryHitCount = 123;
		const arbitraryDamageDistribution = 456;

		const HIT_DMG_DISTRIBUTION_TOTAL_KEY = 'hit dmg% distribution (total)';

		const createDefaultInjectionContext = () => {
			const injectionContext = {
				getProcTargetData: jasmine.createSpy('getProcTargetData'),
				createSourcesFromContext: jasmine.createSpy('createSourcesFromContext'),
			};
			injectionContext.getProcTargetData.and.returnValue(arbitraryTargetData);
			injectionContext.createSourcesFromContext.and.returnValue(arbitrarySourceValue);
			return injectionContext;
		};

		const expectDefaultInjectionContext = (injectionContext, effect, effectContext) => {
			expect(injectionContext.getProcTargetData).toHaveBeenCalledWith(effect);
			expect(injectionContext.createSourcesFromContext).toHaveBeenCalledWith(effectContext);
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

			it('uses getProcTargetData and createSourcesFromContext for buffs', () => {
				const effect = {};
				const context = createArbitraryContext();
				const expectedResult = [{
					id: expectedBuffId,
					originalId: expectedOriginalId,
					sources: arbitrarySourceValue,
					value: { hits: 0, distribution: 0 },
					...arbitraryTargetData,
				}];
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext(injectionContext, effect, context);
			});

			it('uses a buff ID present in the BuffId enum', () => {
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
		});
	});
});
