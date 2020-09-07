const { getConditionalEffectToBuffMapping } = require('./conditional-effect-mapping');
const { BuffId } = require('./buff-types');
const { TargetType, TargetArea } = require('../../datamine-types');

describe('getConditionalEffectToBuffMapping method', () => {
	it('uses the same mapping object on multiple calls', () => {
		const initialMapping = getConditionalEffectToBuffMapping();
		expect(initialMapping).toBeDefined();
		for (let i = 0; i < 5; ++i) {
			expect(getConditionalEffectToBuffMapping()).toBe(initialMapping);
		}
	});

	it('returns a new mapping object when the reload parameter is true', () => {
		const allMappings = new Set();
		const initialMapping = getConditionalEffectToBuffMapping();
		expect(initialMapping).toBeDefined();
		allMappings.add(initialMapping);
		for (let i = 0; i < 5; ++i) {
			const newMapping = getConditionalEffectToBuffMapping(true);
			expect(newMapping).toBeDefined();
			expect(allMappings.has(newMapping))
				.withContext('expect new mapping object to not be in set of previous mappings')
				.toBeFalse();
			allMappings.add(newMapping);
		}

		// should match number of times getConditionalEffectToBuffMapping was called in this test
		expect(allMappings.size)
			.withContext('expect number of mappings added to set to match number of times getConditionalEffectToBuffMapping was called')
			.toBe(6);
	});

	describe('for default mapping', () => {
		/**
		 * @type {import('./conditional-effect-mapping').ConditionalEffectToBuffFunction}
		 */
		let mappingFunction;
		/**
		 * @type {(params?: import('./buff-types').IBuff, propsToDelete?: string[]) => import('./buff-types').IBuff}
		 */
		let baseBuffFactory;

		const arbitrarySourceValue = ['some source value'];
		const arbitraryUnknownValue = { unknownValue: 'some unknown value' };

		// const BUFF_TARGET_PROPS = ['targetType', 'targetArea'];

		const createDefaultInjectionContext = () => {
			/**
			 * @type {import('./_helpers').IBaseBuffProcessingInjectionContext}
			 */
			const injectionContext = {
				createSourcesFromContext: jasmine.createSpy('createSourcesFromContextSpy'),
				createUnknownParamsValue: jasmine.createSpy('createUnkownParamsValueSpy'),
			};
			injectionContext.createSourcesFromContext.and.returnValue(arbitrarySourceValue);
			injectionContext.createUnknownParamsValue.and.returnValue(arbitraryUnknownValue);
			return injectionContext;
		};

		/**
	 * @param {import('./_helpers').IBaseBuffProcessingInjectionContext} injectionContext
	 */
		const expectDefaultInjectionContext = ({ injectionContext, context, unknownParamsArgs = [] }) => {
			expect(injectionContext.createSourcesFromContext).toHaveBeenCalledWith(context);
			expect(injectionContext.createUnknownParamsValue).toHaveBeenCalledWith(...unknownParamsArgs);
		};

		// const expectNoParamsBuffWithEffectAndContext = ({ effect, context, injectionContext, expectedSources }) => {
		// 	const expectedResult = [baseBuffFactory({
		// 		id: BuffId.NO_PARAMS_SPECIFIED,
		// 	}, ['conditions', ...BUFF_TARGET_PROPS])];
		// 	if (expectedSources) {
		// 		expectedResult[0].sources = expectedSources;
		// 	}

		// 	const result = mappingFunction(effect, context, injectionContext);
		// 	expect(result).toEqual(expectedResult);
		// };

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
				const map = getConditionalEffectToBuffMapping();
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

		describe('buff 12', () => {
			const expectedOriginalId = '12';
			const expectedBuffId = 'conditional:12:guaranteed ko resistance';

			beforeEach(() => {
				mappingFunction = getConditionalEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params and turn duration properties', () => {
				const effect = {
					params: '1',
					turnDuration: 2,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 2,
					value: 1,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const effect = {
					params: '1&2&3&4',
					turnDuration: 2,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: 2,
						value: 1,
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_CONDITIONAL_BUFF_PARAMS,
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

			it('defaults the value and turn duration to 0 if they are missing', () => {
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 0,
					value: 0,
				})];

				const result = mappingFunction({}, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('uses createSourcesfromContext and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '123&456',
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						duration: 0,
						value: 123,
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_CONDITIONAL_BUFF_PARAMS,
						sources: arbitrarySourceValue,
						value: arbitraryUnknownValue,
					}),
				];

				const context = createArbitraryContext();
				const injectionContext = createDefaultInjectionContext();
				const result = mappingFunction(effect, context, injectionContext);
				expect(result).toEqual(expectedResult);
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['456']), 1] });
			});
		});
	});
});
