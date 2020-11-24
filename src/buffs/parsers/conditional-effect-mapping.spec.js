const { getConditionalEffectToBuffMapping } = require('./conditional-effect-mapping');
const { BuffId } = require('./buff-types');
const { TargetType, TargetArea, UnitElement } = require('../../datamine-types');

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

		const BUFF_TARGET_PROPS = ['targetType', 'targetArea'];

		const ELEMENT_MAPPING = {
			0: 'all',
			1: UnitElement.Fire,
			2: UnitElement.Water,
			3: UnitElement.Earth,
			4: UnitElement.Thunder,
			5: UnitElement.Light,
			6: UnitElement.Dark,
		};

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

		/**
		 * @description Common set of tests for conditionals that contain only one numerical parameter.
		 * @param {object} context
		 * @param {string} context.expectedOriginalId
		 * @param {string} context.expectedBuffId
		 * @param {boolean?} context.expectToReturnBuffWithValueOfZero
		 */
		const testPassiveWithSingleNumericalParameter = ({
			expectedOriginalId,
			expectedBuffId,
			expectToReturnBuffWithValueOfZero = false,
			getExpectedValueFromParam = (param) => +param,
		}) => {
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
					value: getExpectedValueFromParam(1),
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
						value: getExpectedValueFromParam(1),
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

			if (expectToReturnBuffWithValueOfZero) {
				it('defaults the value and turn duration to 0 if they are missing', () => {
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: 0,
						value: 0,
					})];

					const result = mappingFunction({}, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			} else {
				it('returns a no params buff when no parameters are given', () => {
					expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
				});

				it('returns a no params buff if parsed value from params is zero', () => {
					const effect = { params: '0', turnDuration: 123 };
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('defaults the turn duration to 0 if it is missing', () => {
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: 0,
						value: getExpectedValueFromParam(123),
					})];

					const result = mappingFunction({ params: '123' }, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			}

			it('uses createSourcesfromContext and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '123&456',
					turnDuration: 789,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						duration: 789,
						value: getExpectedValueFromParam(123),
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
		};

		/**
		 * @description Common set of tests for conditionals that contain only one numerical parameter.
		 * @param {object} context
		 * @param {string} context.expectedOriginalId
		 * @param {string} context.expectedBuffIdForBase
		 * @param {string} context.expectedBuffIdForBuff
		 */
		const testPassiveWithOnlyBaseAndBuffResistanceParameters = ({
			expectedOriginalId,
			expectedBuffIdForBase,
			expectedBuffIdForBuff,
		}) => {
			beforeEach(() => {
				mappingFunction = getConditionalEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffIdForBase, expectedBuffIdForBuff]);

			it('uses the params and turn duration properties', () => {
				const effect = {
					params: '1&2',
					turnDuration: 2,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForBase,
						duration: 2,
						value: 1,
					}),
					baseBuffFactory({
						id: expectedBuffIdForBuff,
						duration: 2,
						value: 2,
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const effect = {
					params: '1&2&3&4&5',
					turnDuration: 2,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForBase,
						duration: 2,
						value: 1,
					}),
					baseBuffFactory({
						id: expectedBuffIdForBuff,
						duration: 2,
						value: 2,
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_CONDITIONAL_BUFF_PARAMS,
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

			describe('for missing or 0 values', () => {
				it('returns only value for base if it is non-zero and buff is 0', () => {
					const effect = {
						params: '123&0',
						turnDuration: 2,
					};

					const expectedResult = [baseBuffFactory({
						id: expectedBuffIdForBase,
						duration: 2,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns only value for buff if it is non-zero and base is 0', () => {
					const effect = {
						params: '0&123',
						turnDuration: 2,
					};

					const expectedResult = [baseBuffFactory({
						id: expectedBuffIdForBuff,
						duration: 2,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a no params buff when no parameters are given', () => {
					expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
				});

				it('defaults all params properties to 0 for non-number values', () => {
					const effect = {
						params: 'not a number',
						turnDuration: 2,
					};
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('defaults the turn duration to 0 if it is missing', () => {
					const expectedResult = [
						baseBuffFactory({
							id: expectedBuffIdForBase,
							duration: 0,
							value: 123,
						}),
						baseBuffFactory({
							id: expectedBuffIdForBuff,
							duration: 0,
							value: 456,
						}),
					];

					const result = mappingFunction({ params: '123&456' }, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('uses createSourcesfromContext and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '1&2&456',
					turnDuration: 789,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForBase,
						sources: arbitrarySourceValue,
						duration: 789,
						value: 1,
					}),
					baseBuffFactory({
						id: expectedBuffIdForBuff,
						sources: arbitrarySourceValue,
						duration: 789,
						value: 2,
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['456']), 2] });
			});
		};

		describe('conditional 1', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '1',
				expectedBuffId: 'conditional:1:attack buff',
			});
		});

		describe('conditional 3', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '3',
				expectedBuffId: 'conditional:3:defense buff',
			});
		});

		describe('conditional 5', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '5',
				expectedBuffId: 'conditional:5:recovery buff',
			});
		});

		describe('conditional 7', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '7',
				expectedBuffId: 'conditional:7:critical hit rate buff',
			});
		});

		describe('conditional 8', () => {
			const expectedOriginalId = '8';
			const expectedBuffId = 'conditional:8:gradual heal';

			const ADDED_REC_BUFF_KEY = 'addedRec%';
			const arbitraryRecParam = 80;
			const expectedRecAddedForArbitraryValue = 18;

			beforeEach(() => {
				mappingFunction = getConditionalEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params and turn duration properties', () => {
				const effect = {
					params: `1&2&${arbitraryRecParam}`,
					turnDuration: 2,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 2,
					value: {
						healLow: 1,
						healHigh: 2,
						[ADDED_REC_BUFF_KEY]: expectedRecAddedForArbitraryValue,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const effect = {
					params: `1&2&${arbitraryRecParam}&4&5&6`,
					turnDuration: 2,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: 2,
						value: {
							healLow: 1,
							healHigh: 2,
							[ADDED_REC_BUFF_KEY]: expectedRecAddedForArbitraryValue,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_CONDITIONAL_BUFF_PARAMS,
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

			['healLow', 'healHigh', ADDED_REC_BUFF_KEY].forEach((paramCase) => {
				it(`defaults to 0 for missing ${paramCase} value`, () => {
					const params = ['healLow', 'healHigh', ADDED_REC_BUFF_KEY].map((prop) => prop !== paramCase ? '123' : '').join('&');
					const effect = {
						params,
						turnDuration: 456,
					};
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: 456,
						value: {
							healLow: paramCase === 'healLow' ? 0 : 123,
							healHigh: paramCase === 'healHigh' ? 0 : 123,
							[ADDED_REC_BUFF_KEY]: paramCase === ADDED_REC_BUFF_KEY ? 10 : ((1 + 123 / 100) * 10),
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('returns a no params buff if heal high and heal low values from params are zero', () => {
				const effect = { params: '0,0,1', turnDuration: 123 };
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it('defaults the turn duration to 0 if it is missing', () => {
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 0,
					value: {
						healLow: 1,
						healHigh: 2,
						[ADDED_REC_BUFF_KEY]: expectedRecAddedForArbitraryValue,
					},
				})];

				const result = mappingFunction({ params: `1&2&${arbitraryRecParam}` }, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('uses createSourcesfromContext and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: `1&2&${arbitraryRecParam}&456`,
					turnDuration: 789,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						duration: 789,
						value: {
							healLow: 1,
							healHigh: 2,
							[ADDED_REC_BUFF_KEY]: expectedRecAddedForArbitraryValue,
						},
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['456']), 3] });
			});
		});

		describe('conditional 12', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '12',
				expectedBuffId: 'conditional:12:guaranteed ko resistance',
				expectToReturnBuffWithValueOfZero: true,
			});
		});

		describe('conditional 13', () => {
			const expectedOriginalId = '13';
			const expectedBuffId = 'conditional:13:elemental attack buff';

			beforeEach(() => {
				mappingFunction = getConditionalEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params and turn duration properties', () => {
				const effect = {
					params: '1&2',
					turnDuration: 123,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 123,
					value: 2,
					conditions: {
						targetElements: ['fire'],
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const effect = {
					params: '1&2&3&4&5',
					turnDuration: 123,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: 123,
						value: 2,
						conditions: {
							targetElements: ['fire'],
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_CONDITIONAL_BUFF_PARAMS,
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

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('returns a no params buff if chance from params is zero', () => {
				const effect = { params: '1&0', turnDuration: 123 };
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			describe('when parsing elements', () => {
				Object.entries(ELEMENT_MAPPING).forEach(([elementKey, elementValue]) => {
					it(`parses element key [${elementKey}] as [${elementValue}]`, () => {
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							duration: 456,
							value: 123,
							conditions: {
								targetElements: [elementValue],
							},
						})];

						const result = mappingFunction({ params: `${elementKey}&123`, turnDuration: 456 }, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				it('defaults element to "unknown" if it is missing', () => {
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: 2,
						value: 123,
						conditions: {
							targetElements: ['unknown'],
						},
					})];

					const result = mappingFunction({ params: '&123', turnDuration: 2 }, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('defaults element to "unknown" if it is not one of the mapped elements', () => {
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: 2,
						value: 123,
						conditions: {
							targetElements: ['unknown'],
						},
					})];

					const result = mappingFunction({ params: '1234&123', turnDuration: 2 }, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('defaults the turn duration to 0 if it is missing', () => {
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 0,
					value: 456,
					conditions: {
						targetElements: ['fire'],
					},
				})];

				const result = mappingFunction({ params: '1&456' }, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('uses createSourcesfromContext and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '1&2&456',
					turnDuration: 789,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						duration: 789,
						value: 2,
						conditions: {
							targetElements: ['fire'],
						},
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['456']), 2] });
			});
		});

		describe('conditional 14', () => {
			const expectedOriginalId = '14';
			const expectedBuffId = 'conditional:14:elemental defense buff';

			beforeEach(() => {
				mappingFunction = getConditionalEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params and turn duration properties', () => {
				const effect = {
					params: '1&2',
					turnDuration: 123,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 123,
					value: 2,
					conditions: {
						targetElements: ['fire'],
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const effect = {
					params: '1&2&3&4&5',
					turnDuration: 123,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: 123,
						value: 2,
						conditions: {
							targetElements: ['fire'],
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_CONDITIONAL_BUFF_PARAMS,
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

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('returns a no params buff if chance from params is zero', () => {
				const effect = { params: '1&0', turnDuration: 123 };
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			describe('when parsing elements', () => {
				Object.entries(ELEMENT_MAPPING).forEach(([elementKey, elementValue]) => {
					it(`parses element key [${elementKey}] as [${elementValue}]`, () => {
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							duration: 456,
							value: 123,
							conditions: {
								targetElements: [elementValue],
							},
						})];

						const result = mappingFunction({ params: `${elementKey}&123`, turnDuration: 456 }, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				it('defaults element to "unknown" if it is missing', () => {
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: 2,
						value: 123,
						conditions: {
							targetElements: ['unknown'],
						},
					})];

					const result = mappingFunction({ params: '&123', turnDuration: 2 }, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('defaults element to "unknown" if it is not one of the mapped elements', () => {
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: 2,
						value: 123,
						conditions: {
							targetElements: ['unknown'],
						},
					})];

					const result = mappingFunction({ params: '1234&123', turnDuration: 2 }, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('defaults the turn duration to 0 if it is missing', () => {
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 0,
					value: 456,
					conditions: {
						targetElements: ['fire'],
					},
				})];

				const result = mappingFunction({ params: '1&456' }, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('uses createSourcesfromContext and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '1&2&456',
					turnDuration: 789,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						duration: 789,
						value: 2,
						conditions: {
							targetElements: ['fire'],
						},
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['456']), 2] });
			});
		});

		describe('conditional 21', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '21',
				expectedBuffId: 'conditional:21:fire mitigation',
			});
		});

		describe('conditional 22', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '22',
				expectedBuffId: 'conditional:22:water mitigation',
			});
		});

		describe('conditional 23', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '23',
				expectedBuffId: 'conditional:23:earth mitigation',
			});
		});

		describe('conditional 24', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '24',
				expectedBuffId: 'conditional:24:thunder mitigation',
			});
		});

		describe('conditional 25', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '25',
				expectedBuffId: 'conditional:25:light mitigation',
			});
		});

		describe('conditional 26', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '26',
				expectedBuffId: 'conditional:26:dark mitigation',
			});
		});

		describe('conditional 36', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '36',
				expectedBuffId: 'conditional:36:mitigation',
			});
		});

		describe('conditional 37', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '37',
				expectedBuffId: 'conditional:37:gradual bc fill',
				getExpectedValueFromParam: (param) => +param / 100,
			});
		});

		describe('conditional 40', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '40',
				expectedBuffId: 'conditional:40:spark damage',
			});
		});

		describe('conditional 51', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '51',
				expectedBuffId: 'conditional:51:add fire element',
				expectToReturnBuffWithValueOfZero: true,
			});
		});

		describe('conditional 52', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '52',
				expectedBuffId: 'conditional:52:add water element',
				expectToReturnBuffWithValueOfZero: true,
			});
		});

		describe('conditional 53', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '53',
				expectedBuffId: 'conditional:53:add earth element',
				expectToReturnBuffWithValueOfZero: true,
			});
		});

		describe('conditional 54', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '54',
				expectedBuffId: 'conditional:54:add thunder element',
				expectToReturnBuffWithValueOfZero: true,
			});
		});

		describe('conditional 55', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '55',
				expectedBuffId: 'conditional:55:add light element',
				expectToReturnBuffWithValueOfZero: true,
			});
		});

		describe('conditional 56', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '56',
				expectedBuffId: 'conditional:56:add dark element',
				expectToReturnBuffWithValueOfZero: true,
			});
		});

		describe('conditional 72', () => {
			const BURST_TYPES = ['bb', 'sbb', 'ubb'];
			const expectedOriginalId = '72';

			beforeEach(() => {
				mappingFunction = getConditionalEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(BURST_TYPES.map((burstType) => `conditional:72:attack boost-${burstType}`));

			it('uses the params and turn duration properties', () => {
				const effect = {
					params: '1&2&3',
					turnDuration: 2,
				};
				const splitParams = effect.params.split('&');
				const expectedResult = BURST_TYPES.map((burstType, index) => {
					return baseBuffFactory({
						id: `conditional:72:attack boost-${burstType}`,
						duration: 2,
						value: +(splitParams[index]),
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const effect = {
					params: '1&2&3&4&5&6',
					turnDuration: 2,
				};
				const splitParams = effect.params.split('&');
				const expectedResult = BURST_TYPES.map((burstType, index) => {
					return baseBuffFactory({
						id: `conditional:72:attack boost-${burstType}`,
						duration: 2,
						value: +(splitParams[index]),
					});
				}).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_CONDITIONAL_BUFF_PARAMS,
					value: {
						param_3: '4',
						param_4: '5',
						param_5: '6',
					},
				})]);

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			BURST_TYPES.forEach((burstCase) => {
				it(`returns only value for ${burstCase} if it is non-zero and other non-turn values are 0`, () => {
					const effect = {
						params: BURST_TYPES.map((type) => type === burstCase ? '123' : '0').join('&'),
						turnDuration: 456,
					};
					const expectedResult = [baseBuffFactory({
						id: `conditional:72:attack boost-${burstCase}`,
						duration: 456,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('defaults the turn duration to 0 if it is missing', () => {
				const effect = {
					params: '1&2&3',
				};
				const splitParams = effect.params.split('&');
				const expectedResult = BURST_TYPES.map((burstType, index) => {
					return baseBuffFactory({
						id: `conditional:72:attack boost-${burstType}`,
						duration: 0,
						value: +(splitParams[index]),
					});
				});

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('uses createSourcesfromContext and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0&0&123&456',
					turnDuration: 789,
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'conditional:72:attack boost-ubb',
						sources: arbitrarySourceValue,
						duration: 789,
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['456']), 3] });
			});
		});

		describe('conditional 74', () => {
			const expectedOriginalId = '74';
			const expectedBuffId = 'conditional:74:add atk down to attack';

			beforeEach(() => {
				mappingFunction = getConditionalEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params and turn duration properties', () => {
				const effect = {
					params: '1&2&3',
					turnDuration: 2,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 2,
					value: {
						reductionValue: 1,
						chance: 2,
						debuffTurnDuration: 3,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const effect = {
					params: '1&2&3&4&5&6',
					turnDuration: 2,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: 2,
						value: {
							reductionValue: 1,
							chance: 2,
							debuffTurnDuration: 3,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_CONDITIONAL_BUFF_PARAMS,
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

			describe('when values are missing', () => {
				const PARAMS_ORDER = ['reductionValue', 'chance', 'debuffTurnDuration'];
				PARAMS_ORDER.forEach((paramCase) => {
					it(`defaults to 0 for missing ${paramCase} value`, () => {
						const params = PARAMS_ORDER.map((p) => p !== paramCase ? '123' : '').join('&');
						const effect = { params, turnDuration: 456 };

						const expectedValues = PARAMS_ORDER.reduce((acc, param) => {
							acc[param] = param !== paramCase ? 123 : 0;
							return acc;
						}, {});
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							duration: 456,
							value: expectedValues,
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				it('returns a no params buff when no parameters are given', () => {
					expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
				});

				it('defaults the turn duration to 0 if it is missing', () => {
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: 0,
						value: {
							reductionValue: 1,
							chance: 2,
							debuffTurnDuration: 3,
						},
					})];

					const result = mappingFunction({ params: '1&2&3' }, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('uses createSourcesfromContext and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '1&2&3&456',
					turnDuration: 789,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						duration: 789,
						value: {
							reductionValue: 1,
							chance: 2,
							debuffTurnDuration: 3,
						},
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['456']), 3] });
			});
		});

		describe('conditional 75', () => {
			const expectedOriginalId = '75';
			const expectedBuffId = 'conditional:75:add def down to attack';

			beforeEach(() => {
				mappingFunction = getConditionalEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params and turn duration properties', () => {
				const effect = {
					params: '1&2&3',
					turnDuration: 2,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 2,
					value: {
						reductionValue: 1,
						chance: 2,
						debuffTurnDuration: 3,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const effect = {
					params: '1&2&3&4&5&6',
					turnDuration: 2,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: 2,
						value: {
							reductionValue: 1,
							chance: 2,
							debuffTurnDuration: 3,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_CONDITIONAL_BUFF_PARAMS,
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

			describe('when values are missing', () => {
				const PARAMS_ORDER = ['reductionValue', 'chance', 'debuffTurnDuration'];
				PARAMS_ORDER.forEach((paramCase) => {
					it(`defaults to 0 for missing ${paramCase} value`, () => {
						const params = PARAMS_ORDER.map((p) => p !== paramCase ? '123' : '').join('&');
						const effect = { params, turnDuration: 456 };

						const expectedValues = PARAMS_ORDER.reduce((acc, param) => {
							acc[param] = param !== paramCase ? 123 : 0;
							return acc;
						}, {});
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							duration: 456,
							value: expectedValues,
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				it('returns a no params buff when no parameters are given', () => {
					expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
				});

				it('defaults the turn duration to 0 if it is missing', () => {
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: 0,
						value: {
							reductionValue: 1,
							chance: 2,
							debuffTurnDuration: 3,
						},
					})];

					const result = mappingFunction({ params: '1&2&3' }, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('uses createSourcesfromContext and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '1&2&3&456',
					turnDuration: 789,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						duration: 789,
						value: {
							reductionValue: 1,
							chance: 2,
							debuffTurnDuration: 3,
						},
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['456']), 3] });
			});
		});

		describe('conditional 84', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '84',
				expectedBuffId: 'conditional:84:critical damage',
				getExpectedValueFromParam: (param) => (+param) * 100,
			});
		});

		describe('conditional 91', () => {
			const expectedOriginalId = '91';
			const expectedBuffId = 'conditional:91:chance ko resistance';

			const HP_RECOVER_BUFF_KEY = 'hpRecover%';

			beforeEach(() => {
				mappingFunction = getConditionalEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params and turn duration properties', () => {
				const effect = {
					params: '1&2',
					turnDuration: 2,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 2,
					value: {
						chance: 1,
						[HP_RECOVER_BUFF_KEY]: 2,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const effect = {
					params: '1&2&3&4&5',
					turnDuration: 2,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: 2,
						value: {
							chance: 1,
							[HP_RECOVER_BUFF_KEY]: 2,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_CONDITIONAL_BUFF_PARAMS,
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

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('returns a no params buff if parsed chance from params is zero', () => {
				const effect = { params: '0&1', turnDuration: 123 };
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			it(`defaults ${HP_RECOVER_BUFF_KEY} to 0 if it is missing`, () => {
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 2,
					value: {
						chance: 123,
						[HP_RECOVER_BUFF_KEY]: 0,
					},
				})];

				const result = mappingFunction({ params: '123', turnDuration: 2 }, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('defaults the turn duration to 0 if it is missing', () => {
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 0,
					value: {
						chance: 123,
						[HP_RECOVER_BUFF_KEY]: 456,
					},
				})];

				const result = mappingFunction({ params: '123&456' }, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('uses createSourcesfromContext and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '1&2&456',
					turnDuration: 789,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						duration: 789,
						value: {
							chance: 1,
							[HP_RECOVER_BUFF_KEY]: 2,
						},
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['456']), 2] });
			});
		});

		describe('conditional 98', () => {
			const expectedOriginalId = '98';
			const expectedBuffId = 'conditional:98:thunder barrier';

			beforeEach(() => {
				mappingFunction = getConditionalEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params and turn duration properties', () => {
				const effect = {
					params: '1&2',
					turnDuration: 123,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 123,
					value: {
						hp: 2,
						parsedElement: 'fire',
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const effect = {
					params: '1&2&3&4&5',
					turnDuration: 123,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: 123,
						value: {
							hp: 2,
							parsedElement: 'fire',
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_CONDITIONAL_BUFF_PARAMS,
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

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('returns a no params buff if HP from params is zero', () => {
				const effect = { params: '1&0', turnDuration: 123 };
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			describe('when parsing elements', () => {
				Object.entries(ELEMENT_MAPPING).forEach(([elementKey, elementValue]) => {
					it(`parses element key [${elementKey}] as [${elementValue}]`, () => {
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							duration: 456,
							value: {
								hp: 123,
								parsedElement: elementValue,
							},
						})];

						const result = mappingFunction({ params: `${elementKey}&123`, turnDuration: 456 }, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				it('defaults element to "unknown" if it is missing', () => {
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: 2,
						value: {
							hp: 123,
							parsedElement: 'unknown',
						},
					})];

					const result = mappingFunction({ params: '&123', turnDuration: 2 }, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('uses passed in element parameter if it is not one of the mapped elements', () => {
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: 2,
						value: {
							hp: 123,
							parsedElement: '1234',
						},
					})];

					const result = mappingFunction({ params: '1234&123', turnDuration: 2 }, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('defaults the turn duration to 0 if it is missing', () => {
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 0,
					value: {
						hp: 456,
						parsedElement: 'fire',
					},
				})];

				const result = mappingFunction({ params: '1&456' }, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('uses createSourcesfromContext and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '1&2&456',
					turnDuration: 789,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						duration: 789,
						value: {
							hp: 2,
							parsedElement: 'fire',
						},
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['456']), 2] });
			});
		});


		describe('conditional 99', () => {
			const expectedOriginalId = '99';
			const expectedBuffId = 'conditional:99:light barrier';

			beforeEach(() => {
				mappingFunction = getConditionalEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params and turn duration properties', () => {
				const effect = {
					params: '1&2',
					turnDuration: 123,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 123,
					value: {
						hp: 2,
						parsedElement: 'fire',
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const effect = {
					params: '1&2&3&4&5',
					turnDuration: 123,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: 123,
						value: {
							hp: 2,
							parsedElement: 'fire',
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_CONDITIONAL_BUFF_PARAMS,
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

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('returns a no params buff if HP from params is zero', () => {
				const effect = { params: '1&0', turnDuration: 123 };
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
			});

			describe('when parsing elements', () => {
				Object.entries(ELEMENT_MAPPING).forEach(([elementKey, elementValue]) => {
					it(`parses element key [${elementKey}] as [${elementValue}]`, () => {
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							duration: 456,
							value: {
								hp: 123,
								parsedElement: elementValue,
							},
						})];

						const result = mappingFunction({ params: `${elementKey}&123`, turnDuration: 456 }, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				it('defaults element to "unknown" if it is missing', () => {
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: 2,
						value: {
							hp: 123,
							parsedElement: 'unknown',
						},
					})];

					const result = mappingFunction({ params: '&123', turnDuration: 2 }, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('uses passed in element parameter if it is not one of the mapped elements', () => {
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: 2,
						value: {
							hp: 123,
							parsedElement: '1234',
						},
					})];

					const result = mappingFunction({ params: '1234&123', turnDuration: 2 }, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('defaults the turn duration to 0 if it is missing', () => {
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 0,
					value: {
						hp: 456,
						parsedElement: 'fire',
					},
				})];

				const result = mappingFunction({ params: '1&456' }, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('uses createSourcesfromContext and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '1&2&456',
					turnDuration: 789,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						duration: 789,
						value: {
							hp: 2,
							parsedElement: 'fire',
						},
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['456']), 2] });
			});
		});

		describe('conditional 111', () => {
			const expectedOriginalId = '111';
			const expectedBuffId = 'conditional:111:bc fill on spark';

			beforeEach(() => {
				mappingFunction = getConditionalEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params and turn duration properties', () => {
				const effect = {
					params: '100&200&3',
					turnDuration: 2,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 2,
					value: {
						fillLow: 1,
						fillHigh: 2,
						chance: 3,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const effect = {
					params: '100&200&3&4&5&6',
					turnDuration: 2,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: 2,
						value: {
							fillLow: 1,
							fillHigh: 2,
							chance: 3,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_CONDITIONAL_BUFF_PARAMS,
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

			describe('when values are missing', () => {
				const PARAMS_ORDER = ['fillLow', 'fillHigh', 'chance'];
				PARAMS_ORDER.forEach((paramCase) => {
					it(`defaults to 0 for missing ${paramCase} value`, () => {
						const params = PARAMS_ORDER.map((p) => p !== paramCase ? '12300' : '').join('&');
						const effect = { params, turnDuration: 456 };

						const expectedValues = PARAMS_ORDER.reduce((acc, param) => {
							let value;
							if (param !== paramCase) {
								// fillHigh and fillLow divide by 100
								value = param === 'chance' ? 12300 : 123;
							} else {
								value = 0;
							}
							acc[param] = value;
							return acc;
						}, {});
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							duration: 456,
							value: expectedValues,
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				it('returns a no params buff when no parameters are given', () => {
					expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
				});

				it('defaults the turn duration to 0 if it is missing', () => {
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: 0,
						value: {
							fillLow: 1,
							fillHigh: 2,
							chance: 3,
						},
					})];

					const result = mappingFunction({ params: '100&200&3' }, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('uses createSourcesfromContext and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '100&200&3&456',
					turnDuration: 789,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						duration: 789,
						value: {
							fillLow: 1,
							fillHigh: 2,
							chance: 3,
						},
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['456']), 3] });
			});
		});

		describe('conditional 124', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '124',
				expectedBuffId: 'conditional:124:self attack buff',
			});
		});

		describe('conditional 125', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '125',
				expectedBuffId: 'conditional:125:self defense buff',
			});
		});

		describe('conditional 131', () => {
			const expectedOriginalId = '131';
			const expectedBuffId = 'conditional:131:spark critical';

			const SPARK_DAMAGE_BUFF_KEY = 'sparkDamage%';

			beforeEach(() => {
				mappingFunction = getConditionalEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params and turn duration properties', () => {
				const effect = {
					params: '1&2',
					turnDuration: 2,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 2,
					value: {
						chance: 1,
						[SPARK_DAMAGE_BUFF_KEY]: 2,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const effect = {
					params: '1&2&3&4&5',
					turnDuration: 2,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: 2,
						value: {
							chance: 1,
							[SPARK_DAMAGE_BUFF_KEY]: 2,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_CONDITIONAL_BUFF_PARAMS,
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

			it('returns a no params buff when no parameters are given', () => {
				expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
			});

			it('returns a buff when parsed chance from params is zero', () => {
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 2,
					value: {
						chance: 0,
						[SPARK_DAMAGE_BUFF_KEY]: 123,
					},
				})];

				const result = mappingFunction({ params: '0&123', turnDuration: 2 }, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it(`defaults ${SPARK_DAMAGE_BUFF_KEY} to 0 if it is missing`, () => {
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 2,
					value: {
						chance: 123,
						[SPARK_DAMAGE_BUFF_KEY]: 0,
					},
				})];

				const result = mappingFunction({ params: '123', turnDuration: 2 }, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('defaults the turn duration to 0 if it is missing', () => {
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 0,
					value: {
						chance: 123,
						[SPARK_DAMAGE_BUFF_KEY]: 456,
					},
				})];

				const result = mappingFunction({ params: '123&456' }, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('uses createSourcesfromContext and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '1&2&456',
					turnDuration: 789,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						duration: 789,
						value: {
							chance: 1,
							[SPARK_DAMAGE_BUFF_KEY]: 2,
						},
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['456']), 2] });
			});
		});

		describe('conditional 132', () => {
			testPassiveWithSingleNumericalParameter({
				expectedOriginalId: '132',
				expectedBuffId: 'conditional:132:od fill rate',
			});
		});

		describe('conditional 133', () => {
			const expectedOriginalId = '133';
			const expectedBuffId = 'conditional:133:heal on hit';

			beforeEach(() => {
				mappingFunction = getConditionalEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params and turn duration properties', () => {
				const effect = {
					params: '1&2&3',
					turnDuration: 2,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 2,
					value: {
						healLow: 1,
						healHigh: 2,
						chance: 3,
					},
					conditions: { whenAttacked: true },
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const effect = {
					params: '1&2&3&4&5&6',
					turnDuration: 2,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: 2,
						value: {
							healLow: 1,
							healHigh: 2,
							chance: 3,
						},
						conditions: { whenAttacked: true },
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_CONDITIONAL_BUFF_PARAMS,
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

			describe('when values are missing', () => {
				const PARAMS_ORDER = ['healLow', 'healHigh', 'chance'];
				PARAMS_ORDER.forEach((paramCase) => {
					it(`defaults to 0 for missing ${paramCase} value`, () => {
						const params = PARAMS_ORDER.map((p) => p !== paramCase ? '123' : '').join('&');
						const effect = { params, turnDuration: 456 };

						const expectedValues = PARAMS_ORDER.reduce((acc, param) => {
							acc[param] = param !== paramCase ? 123 : 0;
							return acc;
						}, {});
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							duration: 456,
							value: expectedValues,
							conditions: { whenAttacked: true },
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				it('returns a no params buff when no parameters are given', () => {
					expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
				});

				it('defaults the turn duration to 0 if it is missing', () => {
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: 0,
						value: {
							healLow: 1,
							healHigh: 2,
							chance: 3,
						},
						conditions: { whenAttacked: true },
					})];

					const result = mappingFunction({ params: '1&2&3' }, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('uses createSourcesfromContext and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '1&2&3&456',
					turnDuration: 789,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						duration: 789,
						value: {
							healLow: 1,
							healHigh: 2,
							chance: 3,
						},
						conditions: { whenAttacked: true },
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['456']), 3] });
			});
		});

		describe('conditional 143', () => {
			testPassiveWithOnlyBaseAndBuffResistanceParameters({
				expectedOriginalId: '143',
				expectedBuffIdForBase: 'conditional:143:critical damage reduction-base',
				expectedBuffIdForBuff: 'conditional:143:critical damage reduction-buff',
			});
		});

		describe('conditional 144', () => {
			testPassiveWithOnlyBaseAndBuffResistanceParameters({
				expectedOriginalId: '144',
				expectedBuffIdForBase: 'conditional:144:spark damage reduction-base',
				expectedBuffIdForBuff: 'conditional:144:spark damage reduction-buff',
			});
		});

		describe('conditional 145', () => {
			testPassiveWithOnlyBaseAndBuffResistanceParameters({
				expectedOriginalId: '145',
				expectedBuffIdForBase: 'conditional:145:elemental weakness damage reduction-base',
				expectedBuffIdForBuff: 'conditional:145:elemental weakness damage reduction-buff',
			});
		});

		describe('conditional 153', () => {
			const expectedOriginalId = '153';
			const expectedBuffId = 'conditional:153:chance inflict atk down on hit';

			beforeEach(() => {
				mappingFunction = getConditionalEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedBuffId]);

			it('uses the params and turn duration properties', () => {
				const effect = {
					params: '1&2&3',
					turnDuration: 2,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 2,
					value: {
						reductionValue: 1,
						chance: 2,
						debuffTurnDuration: 3,
					},
					conditions: { whenAttacked: true },
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const effect = {
					params: '1&2&3&4&5&6',
					turnDuration: 2,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						duration: 2,
						value: {
							reductionValue: 1,
							chance: 2,
							debuffTurnDuration: 3,
						},
						conditions: { whenAttacked: true },
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_CONDITIONAL_BUFF_PARAMS,
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

			describe('when values are missing', () => {
				const PARAMS_ORDER = ['reductionValue', 'chance', 'debuffTurnDuration'];
				PARAMS_ORDER.forEach((paramCase) => {
					it(`defaults to 0 for missing ${paramCase} value`, () => {
						const params = PARAMS_ORDER.map((p) => p !== paramCase ? '123' : '').join('&');
						const effect = { params, turnDuration: 456 };

						const expectedValues = PARAMS_ORDER.reduce((acc, param) => {
							acc[param] = param !== paramCase ? 123 : 0;
							return acc;
						}, {});
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							duration: 456,
							value: expectedValues,
							conditions: { whenAttacked: true },
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				it('returns a no params buff when no parameters are given', () => {
					expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
				});

				it('returns a no params buff if reductionValue and chance are 0', () => {
					const effect = {
						params: '0&0&123',
						turnDuration: 456,
					};
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext() });
				});

				it('defaults the turn duration to 0 if it is missing', () => {
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: 0,
						value: {
							reductionValue: 1,
							chance: 2,
							debuffTurnDuration: 3,
						},
						conditions: { whenAttacked: true },
					})];

					const result = mappingFunction({ params: '1&2&3' }, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('uses createSourcesfromContext and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '1&2&3&456',
					turnDuration: 789,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffId,
						sources: arbitrarySourceValue,
						duration: 789,
						value: {
							reductionValue: 1,
							chance: 2,
							debuffTurnDuration: 3,
						},
						conditions: { whenAttacked: true },
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['456']), 3] });
			});
		});

		describe('conditional 10001', () => {
			const STAT_PARAMS_ORDER = ['atk', 'def', 'crit', 'rec'];
			const expectedOriginalId = '10001';
			const expectedStealthBuffKey = 'conditional:10001:stealth';

			beforeEach(() => {
				mappingFunction = getConditionalEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds([expectedStealthBuffKey].concat(STAT_PARAMS_ORDER.map((statType) => `${expectedStealthBuffKey}-${statType}`)));

			it('uses the params and turn duration properties', () => {
				const effect = {
					params: '1&2&3&4',
					turnDuration: 2,
				};
				const splitParams = effect.params.split('&');
				const expectedResult = [baseBuffFactory({
					id: expectedStealthBuffKey,
					duration: 2,
					value: true,
				})].concat(STAT_PARAMS_ORDER.map((statType, index) => {
					return baseBuffFactory({
						id: `${expectedStealthBuffKey}-${statType}`,
						duration: 2,
						value: +(splitParams[index]),
					});
				}));

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const effect = {
					params: '1&2&3&4&5&6&7',
					turnDuration: 2,
				};
				const splitParams = effect.params.split('&');
				const expectedResult = [baseBuffFactory({
					id: expectedStealthBuffKey,
					duration: 2,
					value: true,
				})].concat(STAT_PARAMS_ORDER.map((statType, index) => {
					return baseBuffFactory({
						id: `${expectedStealthBuffKey}-${statType}`,
						duration: 2,
						value: +(splitParams[index]),
					});
				})).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_CONDITIONAL_BUFF_PARAMS,
					value: {
						param_4: '5',
						param_5: '6',
						param_6: '7',
					},
				})]);

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			STAT_PARAMS_ORDER.forEach((statCase) => {
				it(`returns only stat value for ${statCase} with base stealth buff if it is non-zero and other stat values are 0`, () => {
					const effect = {
						params: STAT_PARAMS_ORDER.map((type) => type === statCase ? '123' : '0').join('&'),
						turnDuration: 456,
					};
					const expectedResult = [
						baseBuffFactory({
							id: expectedStealthBuffKey,
							duration: 456,
							value: true,
						}),
						baseBuffFactory({
							id: `${expectedStealthBuffKey}-${statCase}`,
							duration: 456,
							value: 123,
						}),
					];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('returns just the base stealth buff when no parameters are given', () => {
				const effect = {
					turnDuration: 456,
				};
				const expectedResult = [baseBuffFactory({
					id: expectedStealthBuffKey,
					duration: 456,
					value: true,
				})];
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('defaults the turn duration to 0 if it is missing', () => {
				const effect = {
					params: '',
				};
				const expectedResult = [baseBuffFactory({
					id: expectedStealthBuffKey,
					duration: 0,
					value: true,
				})];
				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('uses createSourcesfromContext and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '0&0&0&123&456',
					turnDuration: 789,
				};
				const expectedResult = [
					baseBuffFactory({
						id: expectedStealthBuffKey,
						sources: arbitrarySourceValue,
						duration: 789,
						value: true,
					}),
					baseBuffFactory({
						id: `${expectedStealthBuffKey}-rec`,
						sources: arbitrarySourceValue,
						duration: 789,
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['456']), 4] });
			});
		});

		describe('conditional 10500', () => {
			const expectedOriginalId = '10500';

			beforeEach(() => {
				mappingFunction = getConditionalEffectToBuffMapping().get(expectedOriginalId);
				baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
			});

			testFunctionExistence(expectedOriginalId);
			testValidBuffIds(Object.values(ELEMENT_MAPPING).concat(['unknown']).map((element) => `conditional:10500:shield-${element}`));

			it('uses the params and turn duration properties', () => {
				const effect = {
					params: '0&1&2',
					turnDuration: 2,
				};
				const expectedResult = [baseBuffFactory({
					id: 'conditional:10500:shield-all',
					duration: 2,
					value: {
						hp: 1,
						defense: 2,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff entry for extra parameters', () => {
				const effect = {
					params: '1&2&3&4&5&6',
					turnDuration: 2,
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'conditional:10500:shield-fire',
						duration: 2,
						value: {
							hp: 2,
							defense: 3,
						},
					}),
					baseBuffFactory({
						id: BuffId.UNKNOWN_CONDITIONAL_BUFF_PARAMS,
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

			describe('when parsing element parameter', () => {
				Object.entries(ELEMENT_MAPPING).forEach(([elementKey, elementValue]) => {
					it(`parses value for ${elementValue}`, () => {
						const effect = {
							params: `${elementKey}&1&2`,
							turnDuration: 456,
						};
						const expectedResult = [baseBuffFactory({
							id: `conditional:10500:shield-${elementValue}`,
							duration: 456,
							value: {
								hp: 1,
								defense: 2,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				it('parses unknown elements to "unknown"', () => {
					const effect = {
						params: '1234&1&2',
						turnDuration: 456,
					};
					const expectedResult = [baseBuffFactory({
						id: 'conditional:10500:shield-unknown',
						duration: 456,
						value: {
							hp: 1,
							defense: 2,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			describe('when non-elemental parameters are missing or 0', () => {
				const PARAMS_ORDER = ['hp', 'defense'];
				PARAMS_ORDER.forEach((paramCase) => {
					it(`defaults to 0 for missing ${paramCase} value`, () => {
						const params = ['0', ...PARAMS_ORDER.map((p) => p !== paramCase ? '123' : '')].join('&');
						const effect = { params, turnDuration: 456 };

						const expectedValues = PARAMS_ORDER.reduce((acc, param) => {
							acc[param] = param !== paramCase ? 123 : 0;
							return acc;
						}, {});
						const expectedResult = [baseBuffFactory({
							id: 'conditional:10500:shield-all',
							duration: 456,
							value: expectedValues,
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

				it('returns a no params buff when no parameters are given', () => {
					expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext() });
				});

				it('defaults the turn duration to 0 if it is missing', () => {
					const expectedResult = [baseBuffFactory({
						id: 'conditional:10500:shield-fire',
						duration: 0,
						value: {
							hp: 2,
							defense: 3,
						},
					})];

					const result = mappingFunction({ params: '1&2&3' }, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('uses createSourcesfromContext and createUnknownParamsValue for buffs', () => {
				const effect = {
					params: '1&2&3&456',
					turnDuration: 789,
				};
				const expectedResult = [
					baseBuffFactory({
						id: 'conditional:10500:shield-fire',
						sources: arbitrarySourceValue,
						duration: 789,
						value: {
							hp: 2,
							defense: 3,
						},
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
				expectDefaultInjectionContext({ injectionContext, effect, context, unknownParamsArgs: [jasmine.arrayWithExactContents(['456']), 3] });
			});
		});
	});
});
