const { getPassiveEffectToBuffMapping } = require('./passive-effect-mapping');
const { TargetType, TargetArea } = require('../../datamine-types');
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

		const createDefaultInjectionContext = () => {
			const injectionContext = {
				processExtraSkillConditions: jasmine.createSpy('processExtraSkillConditions'),
				getPassiveTargetData: jasmine.createSpy('getPassiveTargetData'),
				createSourcesFromContext: jasmine.createSpy('createSourcesFromContext'),
			};
			injectionContext.processExtraSkillConditions.and.returnValue(arbitraryConditionValue);
			injectionContext.getPassiveTargetData.and.returnValue(arbitraryTargetData);
			injectionContext.createSourcesFromContext.and.returnValue(arbitrarySourceValue);
			return injectionContext;
		};

		const expectDefaultInjectionContext = (injectionContext, effect, effectContext) => {
			expect(injectionContext.processExtraSkillConditions).toHaveBeenCalledWith(effect);
			expect(injectionContext.getPassiveTargetData).toHaveBeenCalledWith(effect, effectContext);
			expect(injectionContext.createSourcesFromContext).toHaveBeenCalledWith(effectContext);
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
						originalId: '1',
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
						originalId: '1',
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
							originalId: '1',
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

			it('uses processExtraSkillConditions, getPassiveTargetData, and createSourcesfromContext for buffs', () => {
				const effect = {
					'hp% buff': 456,
				};
				const expectedResult = [{
					id: 'passive:1:hp',
					originalId: '1',
					sources: arbitrarySourceValue,
					value: 456,
					conditions: arbitraryConditionValue,
					...arbitraryTargetData,
				}];
				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext(injectionContext, effect, context);
			});
		});
	});
});
