const { UnitElement, TargetArea, TargetType } = require('../../datamine-types');
const { ARBITRARY_TURN_DURATION, ARBITRARY_HIT_COUNT, ARBITRARY_DAMAGE_DISTRIBUTION, HIT_DMG_DISTRIBUTION_TOTAL_KEY, ELEMENT_MAPPING, AILMENT_MAPPING, EFFECT_DELAY_BUFF_PROP, NON_ZERO_ELEMENT_MAPPING } = require('../../_test-helpers/constants');
const { createFactoryForBaseBuffFromArbitraryEffect, testFunctionExistence, testValidBuffIds, createArbitraryBaseEffect, createArbitraryContext, expectNoParamsBuffWithEffectAndContext, testTurnDurationScenarios, testMissingDamageFramesScenarios, testProcWithSingleNumericalParameterAndTurnDuration } = require('../../_test-helpers/proc-effect-mapping.utils');
const { BuffId } = require('./buff-types');
const { getProcEffectToBuffMapping } = require('./proc-effect-mapping');

describe('getProcEffectBuffMapping method for default mapping', () => {
	const DEFAULT_TURN_DURATION_KEY = 'buff turns';

	/**
	 * @type {import('./proc-effect-mapping').ProcEffectToBuffFunction}
	 */
	let mappingFunction;
	/**
	 * @type {(params?: import('./buff-types').IBuff, propsToDelete?: string[]) => import('./buff-types').IBuff}
	 */
	let baseBuffFactory;

	describe('proc 26', () => {
		const expectedBuffId = 'proc:26:hit count boost';
		const expectedOriginalId = '26';
		const hitIncreaseEffectKey = 'hit increase/hit';
		const extraHitDamageEffectKey = 'extra hits dmg%';
		const effectTurnDurationKey = 'hit increase buff turns (50)';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffId]);

		it('uses the params property when it exists', () => {
			const params = `1,0,2,0,0,0,0,${ARBITRARY_TURN_DURATION}`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				duration: ARBITRARY_TURN_DURATION,
				value: {
					hitIncreasePerHit: 1,
					extraHitDamage: 2,
				},
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = `1,2,3,4,5,6,7,${ARBITRARY_TURN_DURATION},9,10,11`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: expectedBuffId,
					duration: ARBITRARY_TURN_DURATION,
					value: {
						hitIncreasePerHit: 1,
						extraHitDamage: 3,
					},
				}),
				baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
					value: {
						param_1: '2',
						param_3: '4',
						param_4: '5',
						param_5: '6',
						param_6: '7',
						param_8: '9',
						param_9: '10',
						param_10: '11',
					},
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra intermediate parameters', () => {
			const params = `1,2,3,4,5,6,7,${ARBITRARY_TURN_DURATION}`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: expectedBuffId,
					duration: ARBITRARY_TURN_DURATION,
					value: {
						hitIncreasePerHit: 1,
						extraHitDamage: 3,
					},
				}),
				baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
					value: {
						param_1: '2',
						param_3: '4',
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
				[hitIncreaseEffectKey]: 3,
				[extraHitDamageEffectKey]: 4,
				[effectTurnDurationKey]: ARBITRARY_TURN_DURATION,
			});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				duration: ARBITRARY_TURN_DURATION,
				value: {
					hitIncreasePerHit: 3,
					extraHitDamage: 4,
				},
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('converts effect properties to numbers when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[hitIncreaseEffectKey]: '3',
				[extraHitDamageEffectKey]: '4',
				[effectTurnDurationKey]: ARBITRARY_TURN_DURATION,
			});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				duration: ARBITRARY_TURN_DURATION,
				value: {
					hitIncreasePerHit: 3,
					extraHitDamage: 4,
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
					const valuesInEffect = Object.keys(effectPropToResultPropMapping)
						.filter((prop) => prop !== effectProp)
						.reduce((acc, prop) => {
							acc[prop] = 123;
							return acc;
						}, {});
					const effect = createArbitraryBaseEffect({
						...valuesInEffect,
						[effectTurnDurationKey]: ARBITRARY_TURN_DURATION,
					});
					const expectedValues = Object.entries(effectPropToResultPropMapping)
						.reduce((acc, [localEffectProp, resultProp]) => {
							acc[resultProp] = localEffectProp === effectProp ? 0 : 123;
							return acc;
						}, {});
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: ARBITRARY_TURN_DURATION,
						value: expectedValues,
					})];

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
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});

			it('returns a no params buff if the effect params are non-number or missing', () => {
				const effect = createArbitraryBaseEffect({ params: 'non-number' });
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});
		});

		describe('when non-turn duration values are 0', () => {
			testTurnDurationScenarios({
				getMappingFunction: () => mappingFunction,
				getBaseBuffFactory: () => baseBuffFactory,
				createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,0,0,${duration}`,
				buffIdsInTurnDurationBuff: [expectedBuffId],
			});
		});
	});

	describe('proc 27', () => {
		const PARAMS_ORDER = ['hpDamageLow%', 'hpDamageHigh%', 'hpDamageChance%', 'atk%', 'flatAtk', 'crit%', 'bc%', 'hc%', 'dmg%'];
		const expectedBuffId = 'proc:27:proportional attack';
		const expectedOriginalId = '27';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffId]);

		it('uses the params property when it exists', () => {
			const params = '1,2,3,4,5,6,7,8,9';
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
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
					hits: ARBITRARY_HIT_COUNT,
					distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			})];

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = '1,2,3,4,5,6,7,8,9,10,11,12';
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
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
						hits: ARBITRARY_HIT_COUNT,
						distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
					},
				}),
				baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
					value: {
						param_9: '10',
						param_10: '11',
						param_11: '12',
					},
				}),
			];

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		it('falls back to effect properties when params property does not exist', () => {
			const mockValues = [10, 11, 12, 13, 14, 15, 16, 17, 18];
			const effectKeyOverrideMapping = {
				flatAtk: 'bb flat atk',
				'hpDamageLow%': 'hp% damage low',
				'hpDamageHigh%': 'hp% damage high',
				'hpDamageChance%': 'hp% damage chance%',
			};
			const valuesInEffect = PARAMS_ORDER.reduce((acc, stat, index) => {
				const key = effectKeyOverrideMapping[stat] || `bb ${stat}`;
				acc[key] = mockValues[index];
				return acc;
			}, {});
			const effect = createArbitraryBaseEffect(valuesInEffect);
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
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
					hits: ARBITRARY_HIT_COUNT,
					distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			})];

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		testMissingDamageFramesScenarios({ expectedBuffId, getMappingFunction: () => mappingFunction, getBaseBuffFactory: () => baseBuffFactory });

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
	});

	describe('proc 28', () => {
		const expectedBuffId = 'proc:28:fixed attack';
		const expectedOriginalId = '28';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffId]);

		it('uses the params property when it exists', () => {
			const effect = createArbitraryBaseEffect({ params: '1' });
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: {
					value: 1,
					hits: ARBITRARY_HIT_COUNT,
					distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			})];

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const effect = createArbitraryBaseEffect({ params: '1,2,3,4' });
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			});
			const expectedResult = [
				baseBuffFactory({
					id: expectedBuffId,
					value: {
						value: 1,
						hits: ARBITRARY_HIT_COUNT,
						distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
					},
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

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({ 'fixed damage': 2 });
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			}, {});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: {
					value: 2,
					hits: ARBITRARY_HIT_COUNT,
					distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			})];

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		testMissingDamageFramesScenarios({ expectedBuffId, getMappingFunction: () => mappingFunction, getBaseBuffFactory: () => baseBuffFactory });
	});

	describe('proc 29', () => {
		const PARAMS_ORDER = ['atk%', 'flatAtk', 'crit%', 'bc%', 'hc%', 'dmg%'];
		const expectedBuffId = 'proc:29:multi-element attack';
		const expectedOriginalId = '29';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffId]);

		it('uses the params property when it exists', () => {
			const params = '1,2,3,4,5,6,7,8,9';
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			});
			const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
				acc[param] = +splitParams[index + 3];
				return acc;
			}, {});
			const expectedElements = ['fire', 'water', 'earth'];
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: {
					elements: expectedElements,
					...expectedValuesForParams,
					hits: ARBITRARY_HIT_COUNT,
					distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			})];

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = '4,5,6,4,5,6,7,8,9,10,11,12';
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			});
			const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
				acc[param] = +splitParams[index + 3];
				return acc;
			}, {});
			const expectedElements = ['thunder', 'light', 'dark'];
			const expectedResult = [
				baseBuffFactory({
					id: expectedBuffId,
					value: {
						elements: expectedElements,
						...expectedValuesForParams,
						hits: ARBITRARY_HIT_COUNT,
						distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
					},
				}),
				baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
					value: {
						param_9: '10',
						param_10: '11',
						param_11: '12',
					},
				}),
			];

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		it('falls back to effect properties when params property does not exist', () => {
			const mockValues = [10, 11, 12, 13, 14, 15];
			const effectKeyOverrideMapping = {
				flatAtk: 'bb flat atk',
			};
			const valuesInEffect = PARAMS_ORDER.reduce((acc, stat, index) => {
				const key = effectKeyOverrideMapping[stat] || `bb ${stat}`;
				acc[key] = mockValues[index];
				return acc;
			}, {});
			valuesInEffect['bb elements'] = ['arbitrary element 1', 'arbitrary element 2'];
			const effect = createArbitraryBaseEffect(valuesInEffect);
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			});
			const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
				acc[param] = +mockValues[index];
				return acc;
			}, {});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: {
					elements: ['arbitrary element 1', 'arbitrary element 2'], // taken at face value
					...expectedValuesForParams,
					hits: ARBITRARY_HIT_COUNT,
					distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			})];

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		testMissingDamageFramesScenarios({ expectedBuffId, getMappingFunction: () => mappingFunction, getBaseBuffFactory: () => baseBuffFactory });

		PARAMS_ORDER.forEach((paramCase) => {
			it(`returns only value for ${paramCase} if it is non-zero and other stats are zero and elements are not specified`, () => {
				const params = ['0,0,0'].concat(PARAMS_ORDER.map((param) => param === paramCase ? '789' : '0')).join(',');
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

		describe('when parsing elements', () => {
			Object.entries(ELEMENT_MAPPING)
				.filter(([elementKey]) => elementKey !== '0')
				.forEach(([elementKey, elementValue]) => {
					it(`parses element param for ${elementValue}`, () => {
						const params = [elementKey, '0,0'].concat(PARAMS_ORDER.map(() => '0')).join(',');
						const effect = createArbitraryBaseEffect({ params });
						const expectedResult = [baseBuffFactory({
							id: expectedBuffId,
							value: {
								elements: [elementValue],
								hits: 0,
								distribution: 0,
							},
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				});

			it('converts element values with no mapping to "unknown"', () => {
				const params = ['123,456,789'].concat(PARAMS_ORDER.map(() => '0')).join(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						elements: ['unknown', 'unknown', 'unknown'],
						hits: 0,
						distribution: 0,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff when no parameters are given', () => {
				const effect = createArbitraryBaseEffect();
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});

			it('does not parse effect["bb elements"] if it is not an array and params property does not exist', () => {
				const effect = createArbitraryBaseEffect({ 'bb elements': 'not an array' });
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});
		});
	});

	describe('proc 30', () => {
		const validElements = [1, 2, 3, 4, 5, 6].map((elementKey) => ELEMENT_MAPPING[elementKey]);
		const effectTurnDurationKey = 'elements added turns';
		const expectedOriginalId = '30';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds(validElements.concat(['unknown']).map((element) => `proc:30:add element-${element}`));

		it('uses the params property when it exists', () => {
			const params = `1,2,3,4,5,6,${ARBITRARY_TURN_DURATION}`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = validElements.map((element) => {
				return baseBuffFactory({
					id: `proc:30:add element-${element}`,
					duration: ARBITRARY_TURN_DURATION,
					value: true,
				});
			});

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = `1,2,3,4,5,6,${ARBITRARY_TURN_DURATION},8,9,10`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = validElements.map((element) => {
				return baseBuffFactory({
					id: `proc:30:add element-${element}`,
					duration: ARBITRARY_TURN_DURATION,
					value: true,
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
				'elements added': validElements.slice(),
				[effectTurnDurationKey]: ARBITRARY_TURN_DURATION,
			});

			const expectedResult = validElements.map((element) => {
				return baseBuffFactory({
					id: `proc:30:add element-${element}`,
					duration: ARBITRARY_TURN_DURATION,
					value: true,
				});
			});

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		Object.entries(ELEMENT_MAPPING)
			.filter(([, elementValue]) => validElements.includes(elementValue))
			.forEach(([elementKey, elementValue]) => {
				it(`parses value for ${elementValue}`, () => {
					const params = `${elementKey},0,0,0,0,0,${ARBITRARY_TURN_DURATION}`;
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: `proc:30:add element-${elementValue}`,
						duration: ARBITRARY_TURN_DURATION,
						value: true,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`parses value for ${elementValue} when params property does not exist`, () => {
					const effect = createArbitraryBaseEffect({
						'elements added': [elementValue],
						[effectTurnDurationKey]: ARBITRARY_TURN_DURATION,
					});

					const expectedResult = [baseBuffFactory({
						id: `proc:30:add element-${elementValue}`,
						duration: ARBITRARY_TURN_DURATION,
						value: true,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

		describe('for unknown element values', () => {
			it('parses unknown elements to "unknown"', () => {
				const params = `123,0,0,0,456,0,${ARBITRARY_TURN_DURATION}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:30:add element-unknown',
						duration: ARBITRARY_TURN_DURATION,
						value: true,
					}),
					baseBuffFactory({
						id: 'proc:30:add element-unknown',
						duration: ARBITRARY_TURN_DURATION,
						value: true,
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('parses unknown elements to "unknown" when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					'elements added': ['arbitrary element 1', 'arbitrary element 2'],
					[effectTurnDurationKey]: ARBITRARY_TURN_DURATION,
				});
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:30:add element-unknown',
						duration: ARBITRARY_TURN_DURATION,
						value: true,
					}),
					baseBuffFactory({
						id: 'proc:30:add element-unknown',
						duration: ARBITRARY_TURN_DURATION,
						value: true,
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns buff for unknown element when params property does not exist and effect["elements added"] property is defined but is not an array', () => {
				const effect = createArbitraryBaseEffect({
					'elements added': 'arbitrary element 1,arbitrary element 2',
					[effectTurnDurationKey]: ARBITRARY_TURN_DURATION,
				});
				const expectedResult = [
					baseBuffFactory({
						id: 'proc:30:add element-unknown',
						duration: ARBITRARY_TURN_DURATION,
						value: true,
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff when params property does not exist and effect["elements added"] property is not defined and turn duration is 0', () => {
				const effect = createArbitraryBaseEffect({
					[effectTurnDurationKey]: 0,
				});
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});
		});

		describe('when no elements are given', () => {
			testTurnDurationScenarios({
				getMappingFunction: () => mappingFunction,
				getBaseBuffFactory: () => baseBuffFactory,
				createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,0,${duration}`,
				buffIdsInTurnDurationBuff: validElements.concat(['unknown']).map((e) => `proc:30:add element-${e}`),
			});
		});
	});

	describe('proc 31', () => {
		const expectedFlatFillId = 'proc:31:bc fill-flat';
		const expectedPercentFillId = 'proc:31:bc fill-percent';
		const FLAT_FILL_KEY = 'increase bb gauge';
		const expectedOriginalId = '31';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedFlatFillId, expectedPercentFillId]);

		it('uses the params property when it exists', () => {
			const params = '100,2';
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
			const params = '100,2,3,4,5';
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

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[FLAT_FILL_KEY]: 3,
			});
			const expectedResult = [
				baseBuffFactory({
					id: expectedFlatFillId,
					value: 3,
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('converts effect properties to numbers when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[FLAT_FILL_KEY]: '4',
			});
			const expectedResult = [
				baseBuffFactory({
					id: expectedFlatFillId,
					value: 4,
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when values are missing', () => {
			it('returns a no params buff when no parameters are given', () => {
				const effect = createArbitraryBaseEffect();
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});

			it('defaults all effect properties to 0 for non-number values', () => {
				const effect = createArbitraryBaseEffect({
					[FLAT_FILL_KEY]: 'not a number',
				});
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});
		});
	});

	describe('proc 32', () => {
		const EFFECT_KEY = 'set attack element attribute';
		const ELEMENT_MAPPING = {
			1: UnitElement.Fire,
			2: UnitElement.Water,
			3: UnitElement.Earth,
			4: UnitElement.Thunder,
			5: UnitElement.Light,
			6: UnitElement.Dark,
		};
		const expectedOriginalId = '32';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds(Object.values(ELEMENT_MAPPING).concat(['unknown']).map((element) => `proc:32:element shift-${element}`));

		it('uses the params property when it exists', () => {
			const effect = createArbitraryBaseEffect({ params: '1' });
			const expectedResult = [baseBuffFactory({
				id: 'proc:32:element shift-fire',
				value: true,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const effect = createArbitraryBaseEffect({ params: '2,2,3,4' });
			const expectedResult = [
				baseBuffFactory({
					id: 'proc:32:element shift-water',
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

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({ [EFFECT_KEY]: 'earth' });
			const expectedResult = [baseBuffFactory({
				id: 'proc:32:element shift-earth',
				value: true,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		Object.entries(ELEMENT_MAPPING).forEach(([elementKey, elementValue]) => {
			it(`parses value for ${elementValue}`, () => {
				const effect = createArbitraryBaseEffect({ params: `${elementKey}` });
				const expectedResult = [baseBuffFactory({
					id: `proc:32:element shift-${elementValue}`,
					value: true,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it(`parses value for ${elementValue} when params property does not exist`, () => {
				const effect = createArbitraryBaseEffect({
					[EFFECT_KEY]: elementValue,
				});
				const expectedResult = [baseBuffFactory({
					id: `proc:32:element shift-${elementValue}`,
					value: true,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});
		});

		it('parses unknown elements to "unknown"', () => {
			const effect = createArbitraryBaseEffect({ params: '1234' });
			const expectedResult = [baseBuffFactory({
				id: 'proc:32:element shift-unknown',
				value: true,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('parses unknown elements to "unknown" when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[EFFECT_KEY]: 'arbitrary unknown element',
			});
			const expectedResult = [baseBuffFactory({
				id: 'proc:32:element shift-unknown',
				value: true,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('parses "all" buff in effect parameters to "unknown" when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[EFFECT_KEY]: 'all',
			});
			const expectedResult = [baseBuffFactory({
				id: 'proc:32:element shift-unknown',
				value: true,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a no params buff if param is 0', () => {
			const effect = createArbitraryBaseEffect({ params: '0' });
			expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
		});

		it('returns a no params buff when no parameters are given', () => {
			expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
		});
	});

	describe('proc 33', () => {
		const expectedBuffId = 'proc:33:buff wipe';
		const expectedOriginalId = '33';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffId]);

		it('uses the params property when it exists', () => {
			const effect = createArbitraryBaseEffect({ params: '123' });
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: 123,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const effect = createArbitraryBaseEffect({ params: '123,2,3,4' });
			const expectedResult = [
				baseBuffFactory({
					id: expectedBuffId,
					value: 123,
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

		it('falls back to stat-specific properties when the params property does not exist', () => {
			const effect = createArbitraryBaseEffect({ 'clear buff chance%': 456 });
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: 456,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a no params buff when no parameters are given', () => {
			const effect = createArbitraryBaseEffect();
			expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
		});

		it('returns a no params buff if parsed value from params is zero', () => {
			const effect = createArbitraryBaseEffect({ params: '0' });
			expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
		});

		it('returns a no params buff if all effect properties are non-number values', () => {
			const effect = createArbitraryBaseEffect({ 'clear buff chance%': 'not a number' });
			expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
		});

		it('returns a no params buff if the effect params are non-number or missing', () => {
			const effect = createArbitraryBaseEffect({ params: 'non-number' });
			expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
		});
	});

	describe('proc 34', () => {
		const expectedFlatDrainId = 'proc:34:bc drain-flat';
		const expectedPercentDrainId = 'proc:34:bc drain-percent';
		const FLAT_DRAIN_LOW_KEY = 'base bb gauge reduction low';
		const FLAT_DRAIN_HIGH_KEY = 'base bb gauge reduction high';
		const PERCENT_DRAIN_LOW_KEY = 'bb gauge% reduction low';
		const PERCENT_DRAIN_HIGH_KEY = 'bb gauge% reduction high';
		const CHANCE_KEY = 'bb gauge reduction chance%';
		const expectedOriginalId = '34';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedFlatDrainId, expectedPercentDrainId]);

		it('uses the params property when it exists', () => {
			const params = '100,200,3,4,5';
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: expectedFlatDrainId,
					value: {
						drainLow: 1,
						drainHigh: 2,
						chance: 5,
					},
				}),
				baseBuffFactory({
					id: expectedPercentDrainId,
					value: {
						drainLow: 3,
						drainHigh: 4,
						chance: 5,
					},
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = '100,200,3,4,5,6,7,8';
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: expectedFlatDrainId,
					value: {
						drainLow: 1,
						drainHigh: 2,
						chance: 5,
					},
				}),
				baseBuffFactory({
					id: expectedPercentDrainId,
					value: {
						drainLow: 3,
						drainHigh: 4,
						chance: 5,
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
				[FLAT_DRAIN_LOW_KEY]: 6,
				[FLAT_DRAIN_HIGH_KEY]: 7,
				[PERCENT_DRAIN_LOW_KEY]: 8,
				[PERCENT_DRAIN_HIGH_KEY]: 9,
				[CHANCE_KEY]: 10,
			});
			const expectedResult = [
				baseBuffFactory({
					id: expectedFlatDrainId,
					value: {
						drainLow: 6,
						drainHigh: 7,
						chance: 10,
					},
				}),
				baseBuffFactory({
					id: expectedPercentDrainId,
					value: {
						drainLow: 8,
						drainHigh: 9,
						chance: 10,
					},
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('converts effect properties to numbers when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[FLAT_DRAIN_LOW_KEY]: '11',
				[FLAT_DRAIN_HIGH_KEY]: '12',
				[PERCENT_DRAIN_LOW_KEY]: '13',
				[PERCENT_DRAIN_HIGH_KEY]: '14',
				[CHANCE_KEY]: '15',
			});
			const expectedResult = [
				baseBuffFactory({
					id: expectedFlatDrainId,
					value: {
						drainLow: 11,
						drainHigh: 12,
						chance: 15,
					},
				}),
				baseBuffFactory({
					id: expectedPercentDrainId,
					value: {
						drainLow: 13,
						drainHigh: 14,
						chance: 15,
					},
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when values are missing', () => {
			const nonChanceKeys = [FLAT_DRAIN_LOW_KEY, FLAT_DRAIN_HIGH_KEY, PERCENT_DRAIN_LOW_KEY, PERCENT_DRAIN_HIGH_KEY];
			nonChanceKeys.forEach((effectKey) => {
				it(`defaults to 0 for missing effect parameter [${effectKey}] when params property does not exist`, () => {
					const valuesInEffect = nonChanceKeys.reduce((acc, key) => {
						if (key !== effectKey) {
							acc[key] = 123;
						}
						return acc;
					}, {});
					valuesInEffect[CHANCE_KEY] = 456;
					const effect = createArbitraryBaseEffect(valuesInEffect);
					const expectedResult = [
						baseBuffFactory({
							id: expectedFlatDrainId,
							value: {
								drainLow: effectKey === FLAT_DRAIN_LOW_KEY ? 0 : 123,
								drainHigh: effectKey === FLAT_DRAIN_HIGH_KEY ? 0 : 123,
								chance: 456,
							},
						}),
						baseBuffFactory({
							id: expectedPercentDrainId,
							value: {
								drainLow: effectKey === PERCENT_DRAIN_LOW_KEY ? 0 : 123,
								drainHigh: effectKey === PERCENT_DRAIN_HIGH_KEY ? 0 : 123,
								chance: 456,
							},
						}),
					];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('does not return a flat drain buff if both flat drain parameters are 0', () => {
				const params = '0,0,1,2,3';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedPercentDrainId,
					value: {
						drainLow: 1,
						drainHigh: 2,
						chance: 3,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('does not return a percent drain buff if both percent drain parameters are 0', () => {
				const params = '100,200,0,0,3';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedFlatDrainId,
					value: {
						drainLow: 1,
						drainHigh: 2,
						chance: 3,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff when no parameters are given', () => {
				const effect = createArbitraryBaseEffect();
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});

			it('returns a no params buff when drain values are zero and chance value is non-zero', () => {
				const params = '0,0,0,0,123';
				const effect = createArbitraryBaseEffect({ params });
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});

			it('defaults all effect properties to 0 for non-number values', () => {
				const effect = createArbitraryBaseEffect({
					[FLAT_DRAIN_LOW_KEY]: 'not a number',
					[FLAT_DRAIN_HIGH_KEY]: 'not a number',
					[PERCENT_DRAIN_LOW_KEY]: 'not a number',
					[PERCENT_DRAIN_HIGH_KEY]: 'not a number',
					[CHANCE_KEY]: 'not a number',
				});
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});
		});
	});

	describe('proc 36', () => {
		const expectedOriginalId = '36';
		testProcWithSingleNumericalParameterAndTurnDuration({
			getMappingFunction: () => getProcEffectToBuffMapping().get(expectedOriginalId),
			getBaseBuffFactory: () => createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId),
			expectedOriginalId,
			expectedBuffId: 'proc:36:ls lock',
			effectValueKey: 'invalidate LS chance%',
			effectTurnDurationKey: 'invalidate LS turns (60)',
		});
	});

	describe('proc 37', () => {
		const expectedBuffId = 'proc:37:summon';
		const expectedOriginalId = '37';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffId]);

		it('uses the params property when it exists', () => {
			const params = '1,2,3,4';
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: {
					summonGroup: '1',
					summonId: '2',
					positionX: 3,
					positionY: 4,
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
					id: expectedBuffId,
					value: {
						summonGroup: '1',
						summonId: '2',
						positionX: 3,
						positionY: 4,
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

		it('falls back to unknown proc params property when params property does not exist', () => {
			const params = '5,6,7,8';
			const effect = createArbitraryBaseEffect({ 'unknown proc param': params });
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: {
					summonGroup: '5',
					summonId: '6',
					positionX: 7,
					positionY: 8,
				},
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when values are missing', () => {
			// order of test cases should match order in params property
			[
				{ property: 'summonGroup', expectedDefault: '' },
				{ property: 'summonId', expectedDefault: '' },
				{ property: 'positionX', expectedDefault: 0 },
				{ property: 'positionY', expectedDefault: 0 },
			].forEach((testCase, index) => {
				it(`defaults to ${testCase.expectedDefault === '' ? 'empty string' : testCase.expectedDefault} for missing ${testCase.property} value`, () => {
					const params = Array.from({ length: 4 }).fill(0).map((_, i) => i === index ? '' : (i + 1)).join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							summonGroup: testCase.property === 'summonGroup' ? testCase.expectedDefault : '1',
							summonId: testCase.property === 'summonId' ? testCase.expectedDefault : '2',
							positionX: testCase.property === 'positionX' ? testCase.expectedDefault : 3,
							positionY: testCase.property === 'positionY' ? testCase.expectedDefault : 4,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('returns a no params buff when no parameters are given', () => {
				const effect = createArbitraryBaseEffect();
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});

			it('returns a no params buff when summonGroup and summonId are missing', () => {
				const effect = createArbitraryBaseEffect({ params: ',,1,2' });
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});

			it('defaults position properties to 0 for non-number values', () => {
				const params = '1,2,not a number,not a number';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						summonGroup: '1',
						summonId: '2',
						positionX: 0,
						positionY: 0,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});
		});
	});

	describe('proc 38', () => {
		const expectedOriginalId = '38';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds(Object.values(AILMENT_MAPPING).concat(['unknown']).map((a) => `proc:38:cleanse-${a}`));

		it('uses the params property when it exists', () => {
			const params = '1,2,3,4,5,6,7,8,9';
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = Object.values(AILMENT_MAPPING)
				.map((ailment) => baseBuffFactory({
					id: `proc:38:cleanse-${ailment}`,
					value: true,
				}));

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = '1,2,3,4,5,6,7,8,9,10,11,12';
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = Object.values(AILMENT_MAPPING)
				.map((ailment) => baseBuffFactory({
					id: `proc:38:cleanse-${ailment}`,
					value: true,
				})).concat([baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
					value: {
						param_9: '10',
						param_10: '11',
						param_11: '12',
					},
				})]);

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				'ailments cured': ['rec down'],
			});
			const expectedResult = [baseBuffFactory({
				id: 'proc:38:cleanse-rec down',
				value: true,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		Object.entries(AILMENT_MAPPING).forEach(([ailmentKey, ailmentName]) => {
			it(`returns an entry for ${ailmentName} when it is present in the params property`, () => {
				const params = [ailmentKey, '0,0,0,0,0,0,0,0'].join(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: `proc:38:cleanse-${ailmentName}`,
					value: true,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it(`returns an entry for ${ailmentName} when it is present in the effect and no params property does not exist`, () => {
				const effectKey = ailmentName !== 'weak' ? ailmentName : 'weaken';
				const effect = createArbitraryBaseEffect({ 'ailments cured': [effectKey] });
				const expectedResult = [baseBuffFactory({
					id: `proc:38:cleanse-${ailmentName}`,
					value: true,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});
		});

		it('parses multiple cleanse entries in effect when params property does not exist', () => {
			const curedAilments = Object.values(AILMENT_MAPPING)
				.map((ailment) => ailment !== 'weak' ? ailment : 'weaken');
			const effect = createArbitraryBaseEffect({ 'ailments cured': curedAilments });
			const expectedResult = Object.values(AILMENT_MAPPING)
				.map((ailment) => baseBuffFactory({
					id: `proc:38:cleanse-${ailment}`,
					value: true,
				}));

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('parses params outside of the known ailments as unknown', () => {
			const params = '123,0,0,0,0,0,0';
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [baseBuffFactory({
				id: 'proc:38:cleanse-unknown',
				value: true,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('parses params outside of the known ailments as unknown when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({ 'ailments cured': ['fake', 'not an ailment', 'poison'] });
			const expectedResult = [
				baseBuffFactory({
					id: 'proc:38:cleanse-poison',
					value: true,
				}),
				baseBuffFactory({
					id: 'proc:38:cleanse-unknown',
					value: true,
				}),
				baseBuffFactory({
					id: 'proc:38:cleanse-unknown',
					value: true,
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a no params buff when no parameters are given', () => {
			const effect = createArbitraryBaseEffect();
			expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
		});

		it('returns a no params buff if all params are 0', () => {
			const params = new Array(9).fill('0').join(',');
			const effect = createArbitraryBaseEffect({ params });
			expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
		});
	});

	describe('proc 39', () => {
		const EFFECT_MITIGATION_KEY = 'dmg% mitigation for elemental attacks';
		const EFFECT_TURN_DURATION_KEY = 'dmg% mitigation for elemental attacks buff turns';
		const expectedOriginalId = '39';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds(Object.values(NON_ZERO_ELEMENT_MAPPING).concat(['unknown']).map((element) => `proc:39:mitigate-${element}`));

		it('uses the params property when it exists', () => {
			const params = `1,2,3,4,5,6,7,${ARBITRARY_TURN_DURATION}`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = Object.values(NON_ZERO_ELEMENT_MAPPING).map((element) => {
				return baseBuffFactory({
					id: `proc:39:mitigate-${element}`,
					duration: ARBITRARY_TURN_DURATION,
					value: 7,
				});
			});

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = `1,2,3,4,5,6,7,${ARBITRARY_TURN_DURATION},9,10,11`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = Object.values(NON_ZERO_ELEMENT_MAPPING).map((element) => {
				return baseBuffFactory({
					id: `proc:39:mitigate-${element}`,
					duration: ARBITRARY_TURN_DURATION,
					value: 7,
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
				acc[`mitigate ${element} attacks`] = true;
				return acc;
			}, {});
			valuesInEffect[EFFECT_MITIGATION_KEY] = 9;
			valuesInEffect[EFFECT_TURN_DURATION_KEY] = ARBITRARY_TURN_DURATION;
			const effect = createArbitraryBaseEffect(valuesInEffect);
			const expectedResult = Object.values(NON_ZERO_ELEMENT_MAPPING).map((element) => {
				return baseBuffFactory({
					id: `proc:39:mitigate-${element}`,
					duration: ARBITRARY_TURN_DURATION,
					value: 9,
				});
			});
			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		Object.entries(NON_ZERO_ELEMENT_MAPPING).forEach(([elementKey, elementValue]) => {
			it(`parses value for ${elementValue}`, () => {
				const params = `${elementKey},0,0,0,0,0,123,${ARBITRARY_TURN_DURATION}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: `proc:39:mitigate-${elementValue}`,
					duration: ARBITRARY_TURN_DURATION,
					value: 123,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it(`parses value for ${elementValue} when params property does not exist`, () => {
				const effect = createArbitraryBaseEffect({
					[`mitigate ${elementValue} attacks`]: true,
					[EFFECT_MITIGATION_KEY]: 456,
					[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
				});
				const expectedResult = [baseBuffFactory({
					id: `proc:39:mitigate-${elementValue}`,
					duration: ARBITRARY_TURN_DURATION,
					value: 456,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});
		});

		it('parses unknown elements to "unknown"', () => {
			const params = `1234,0,0,0,0,0,123,${ARBITRARY_TURN_DURATION}`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [baseBuffFactory({
				id: 'proc:39:mitigate-unknown',
				duration: ARBITRARY_TURN_DURATION,
				value: 123,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('parses lack of elements to "unknown" when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[EFFECT_MITIGATION_KEY]: 456,
				[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
			});
			const expectedResult = [baseBuffFactory({
				id: 'proc:39:mitigate-unknown',
				duration: ARBITRARY_TURN_DURATION,
				value: 456,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when no mitigation value is given', () => {
			testTurnDurationScenarios({
				getMappingFunction: () => mappingFunction,
				getBaseBuffFactory: () => baseBuffFactory,
				createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,0,0,${duration}`,
				buffIdsInTurnDurationBuff: Object.values(NON_ZERO_ELEMENT_MAPPING).concat(['unknown']).map((stat) => `proc:39:mitigate-${stat}`),
			});

			it('returns a turn modification buff turn duration is non-zero and params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
				});
				const expectedResult = [baseBuffFactory({
					id: BuffId.TURN_DURATION_MODIFICATION,
					value: {
						buffs: Object.values(NON_ZERO_ELEMENT_MAPPING).concat(['unknown']).map((stat) => `proc:39:mitigate-${stat}`),
						duration: ARBITRARY_TURN_DURATION,
					},
				}, [EFFECT_DELAY_BUFF_PROP])];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});
		});
	});

	describe('proc 40', () => {
		const expectedOriginalId = '40';
		const AILMENT_EFFECT_KEY_MAPPING = {
			poison: 'poison% buff',
			weak: 'weaken% buff',
			sick: 'sick% buff',
			injury: 'injury% buff',
			curse: 'curse% buff',
			paralysis: 'paralysis% buff',
			'atk down': 'atk down buff',
			'def down': 'def down buff',
			'rec down': 'rec down buff',
		};

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds(Object.values(AILMENT_MAPPING).concat(['unknown']).map((a) => `proc:40:add ailment-${a}`));

		it('uses the params property when it exists', () => {
			const params = `1,1,2,2,3,3,4,4,${ARBITRARY_TURN_DURATION}`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: 'proc:40:add ailment-poison',
					duration: ARBITRARY_TURN_DURATION,
					value: 1,
				}),
				baseBuffFactory({
					id: 'proc:40:add ailment-weak',
					duration: ARBITRARY_TURN_DURATION,
					value: 2,
				}),
				baseBuffFactory({
					id: 'proc:40:add ailment-sick',
					duration: ARBITRARY_TURN_DURATION,
					value: 3,
				}),
				baseBuffFactory({
					id: 'proc:40:add ailment-injury',
					duration: ARBITRARY_TURN_DURATION,
					value: 4,
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = `5,5,6,6,7,7,8,8,${ARBITRARY_TURN_DURATION},10,11,12`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: 'proc:40:add ailment-curse',
					duration: ARBITRARY_TURN_DURATION,
					value: 5,
				}),
				baseBuffFactory({
					id: 'proc:40:add ailment-paralysis',
					duration: ARBITRARY_TURN_DURATION,
					value: 6,
				}),
				baseBuffFactory({
					id: 'proc:40:add ailment-atk down',
					duration: ARBITRARY_TURN_DURATION,
					value: 7,
				}),
				baseBuffFactory({
					id: 'proc:40:add ailment-def down',
					duration: ARBITRARY_TURN_DURATION,
					value: 8,
				}),
				baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
					value: {
						param_9: '10',
						param_10: '11',
						param_11: '12',
					},
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				'rec down buff': 10,
				[DEFAULT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
			});
			const expectedResult = [baseBuffFactory({
				id: 'proc:40:add ailment-rec down',
				duration: ARBITRARY_TURN_DURATION,
				value: 10,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		Object.entries(AILMENT_MAPPING).forEach(([ailmentKey, ailmentName]) => {
			it(`returns an entry for ${ailmentName} when it is present in the params property`, () => {
				const params = `${ailmentKey},123,0,0,0,0,0,0,${ARBITRARY_TURN_DURATION}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: `proc:40:add ailment-${ailmentName}`,
					duration: ARBITRARY_TURN_DURATION,
					value: 123,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it(`returns an entry for ${ailmentName} when it is present in the effect and no params property does not exist`, () => {
				const effect = createArbitraryBaseEffect({
					[AILMENT_EFFECT_KEY_MAPPING[ailmentName]]: 456,
					[DEFAULT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
				});
				const expectedResult = [baseBuffFactory({
					id: `proc:40:add ailment-${ailmentName}`,
					duration: ARBITRARY_TURN_DURATION,
					value: 456,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});
		});

		it('parses multiple inflict entries in effect when params property does not exist', () => {
			const valuesInEffect = Object.values(AILMENT_MAPPING).reduce((acc, ailment, index) => {
				acc[AILMENT_EFFECT_KEY_MAPPING[ailment]] = index + 1;
				return acc;
			}, {});
			valuesInEffect[DEFAULT_TURN_DURATION_KEY] = ARBITRARY_TURN_DURATION;
			const effect = createArbitraryBaseEffect(valuesInEffect);
			const expectedResult = Object.values(AILMENT_MAPPING)
				.map((ailment, index) => baseBuffFactory({
					id: `proc:40:add ailment-${ailment}`,
					duration: ARBITRARY_TURN_DURATION,
					value: index + 1,
				}));

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('parses params outside of the known ailments as unknown', () => {
			const params = `123,456,0,0,0,0,0,0,${ARBITRARY_TURN_DURATION}`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [baseBuffFactory({
				id: 'proc:40:add ailment-unknown',
				duration: ARBITRARY_TURN_DURATION,
				value: 456,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when no ailment values are given', () => {
			testTurnDurationScenarios({
				getMappingFunction: () => mappingFunction,
				getBaseBuffFactory: () => baseBuffFactory,
				createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,0,0,0,${duration}`,
				buffIdsInTurnDurationBuff: Object.values(AILMENT_MAPPING).concat(['unknown']).map((ailment) => `proc:40:add ailment-${ailment}`),
			});

			it('returns a turn modification buff when turn duration is non-zero and params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[DEFAULT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
				});
				const expectedResult = [baseBuffFactory({
					id: BuffId.TURN_DURATION_MODIFICATION,
					value: {
						buffs: Object.values(AILMENT_MAPPING).concat(['unknown']).map((ailment) => `proc:40:add ailment-${ailment}`),
						duration: ARBITRARY_TURN_DURATION,
					},
				}, [EFFECT_DELAY_BUFF_PROP])];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});
		});
	});

	describe('proc 42', () => {
		const PARAMS_ORDER = ['atkLow%', 'atkHigh%', 'flatAtk'];
		const expectedBuffIdForAttack = 'proc:42:sacrificial attack';
		const expectedBuffIdForSelfKo = 'proc:42:instant death';
		const expectedOriginalId = '42';

		const createExpectedBuffForSelfKo = () => baseBuffFactory({
			id: expectedBuffIdForSelfKo,
			value: true,
			targetArea: TargetArea.Single,
			targetType: TargetType.Self,
		});

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffIdForAttack]);

		it('uses the params property when it exists', () => {
			const params = '1,2,3';
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
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
						hits: ARBITRARY_HIT_COUNT,
						distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
					},
				}),
				createExpectedBuffForSelfKo(),
			];

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = '1,2,3,4,5,6';
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
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
						hits: ARBITRARY_HIT_COUNT,
						distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
					},
				}),
				createExpectedBuffForSelfKo(),
				baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
					value: {
						param_3: '4',
						param_4: '5',
						param_5: '6',
					},
				}),
			];

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		it('falls back to unknown proc params property when params property does not exist', () => {
			const params = '4,5,6';
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ 'unknown proc param': params });
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
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
						hits: ARBITRARY_HIT_COUNT,
						distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
					},
				}),
				createExpectedBuffForSelfKo(),
			];

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		testMissingDamageFramesScenarios({
			getMappingFunction: () => mappingFunction,
			getBaseBuffFactory: () => baseBuffFactory,
			expectedBuffId: expectedBuffIdForAttack,
			getAdditionalBuffs: () => [createExpectedBuffForSelfKo()],
		});

		describe('when values are missing', () => {
			PARAMS_ORDER.forEach((paramCase) => {
				it(`returns only value for ${paramCase} if it is non-zero and other stats are zero`, () => {
					const params = PARAMS_ORDER.map((prop) => prop === paramCase ? '789' : '0').join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [
						baseBuffFactory({
							id: expectedBuffIdForAttack,
							value: {
								[paramCase]: 789,
								hits: 0,
								distribution: 0,
							},
						}),
						createExpectedBuffForSelfKo(),
					];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});
		});
	});

	describe('proc 43', () => {
		const expectedBuffId = 'proc:43:burst od fill';
		const expectedOriginalId = '43';
		const EFFECT_KEY = 'increase od gauge%';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffId]);

		it('uses the params property when it exists', () => {
			const params = '1';
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: 1,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = '5,2,3,4';
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: expectedBuffId,
					value: 5,
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

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[EFFECT_KEY]: 2,
			});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: 2,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('converts effect properties to numbers when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[EFFECT_KEY]: 3,
			});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: 3,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a no params buff when no parameters are given', () => {
			const effect = createArbitraryBaseEffect();
			expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
		});

		it('returns a no params buff when value is 0', () => {
			const effect = createArbitraryBaseEffect({ param: '0' });
			expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
		});

		it('defaults all effect properties to 0 for non-number values', () => {
			const effect = createArbitraryBaseEffect({
				[EFFECT_KEY]: 'not a number',
			});
			expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
		});

		it('defaults values for effect params to 0 if they are non-number or missing', () => {
			const effect = createArbitraryBaseEffect({ params: 'non-number' });
			expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
		});
	});

	describe('proc 44', () => {
		const PARAMS_ORDER = ['atk%', 'flatAtk', 'dmg%', 'affectsElement', 'unitIndex'];
		const effectPropToResultPropMapping = {
			'dot atk%': 'atk%',
			'dot flat atk': 'flatAtk',
			'dot dmg%': 'dmg%',
			'dot element affected': 'affectsElement',
			'dot unit index': 'unitIndex',
		};
		const EFFECT_TURN_DURATION_KEY = 'dot turns (71)';
		const expectedBuffId = 'proc:44:damage over time';
		const expectedOriginalId = '44';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffId]);

		it('uses the params property when it exists', () => {
			const params = `1,2,3,4,5,${ARBITRARY_TURN_DURATION}`;
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const expectedValuesForParams = PARAMS_ORDER.reduce((acc, key, index) => {
				acc[key] = key !== 'affectsElement' ? +splitParams[index] : true;
				return acc;
			}, {});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				duration: ARBITRARY_TURN_DURATION,
				value: expectedValuesForParams,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = `1,2,3,1,5,${ARBITRARY_TURN_DURATION},7,8,9`;
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const expectedValuesForParams = PARAMS_ORDER.reduce((acc, key, index) => {
				acc[key] = key !== 'affectsElement' ? +splitParams[index] : false;
				return acc;
			}, {});
			const expectedResult = [
				baseBuffFactory({
					id: expectedBuffId,
					duration: ARBITRARY_TURN_DURATION,
					value: expectedValuesForParams,
				}),
				baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
					value: {
						param_6: '7',
						param_7: '8',
						param_8: '9',
					},
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('falls back to effect properties when params property does not exist', () => {
			const pairs = Object.entries(effectPropToResultPropMapping);
			const valuesInEffect = pairs.reduce((acc, [effectKey, propKey], index) => {
				acc[effectKey] = propKey !== 'affectsElement' ? (index + 1) : true;
				return acc;
			}, {});
			valuesInEffect[EFFECT_TURN_DURATION_KEY] = ARBITRARY_TURN_DURATION;
			const effect = createArbitraryBaseEffect(valuesInEffect);
			const expectedValues = pairs.reduce((acc, [, propKey], index) => {
				acc[propKey] = propKey !== 'affectsElement' ? (index + 1) : true;
				return acc;
			}, {});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				duration: ARBITRARY_TURN_DURATION,
				value: expectedValues,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('falls back to effect properties when params property does not exist', () => {
			const pairs = Object.entries(effectPropToResultPropMapping);
			const valuesInEffect = pairs.reduce((acc, [effectKey, propKey], index) => {
				acc[effectKey] = propKey !== 'affectsElement' ? `${(index + 2)}` : false;
				return acc;
			}, {});
			valuesInEffect[EFFECT_TURN_DURATION_KEY] = ARBITRARY_TURN_DURATION;
			const effect = createArbitraryBaseEffect(valuesInEffect);
			const expectedValues = pairs.reduce((acc, [, propKey], index) => {
				acc[propKey] = propKey !== 'affectsElement' ? (index + 2) : false;
				return acc;
			}, {});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				duration: ARBITRARY_TURN_DURATION,
				value: expectedValues,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when some values are missing or 0', () => {
			const effectBuffKeyPairs = Object.entries(effectPropToResultPropMapping);
			['dot atk%', 'dot flat atk', 'dot dmg%'].forEach((effectProp) => {
				const buffProp = effectPropToResultPropMapping[effectProp];
				const filteredPairs = effectBuffKeyPairs
					.filter(([prop]) => prop !== effectProp);
				it(`filters out value of [buffProp:${buffProp}] if it is 0 in params`, () => {
					const params = [...PARAMS_ORDER.map((key) => key !== buffProp ? '123' : '0'), ARBITRARY_TURN_DURATION].join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedValues = filteredPairs.reduce((acc, [, buffProp]) => {
						acc[buffProp] = buffProp !== 'affectsElement' ? 123 : true;
						return acc;
					}, {});
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: ARBITRARY_TURN_DURATION,
						value: expectedValues,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`filters out value of [effectProp:${effectProp}] if it is missing from effect and params property does not exist`, () => {
					const valuesInEffect = filteredPairs.reduce((acc, [localEffectProp, buffProp]) => {
						acc[localEffectProp] = buffProp !== 'affectsElement' ? 123 : true;
						return acc;
					}, {});
					valuesInEffect[EFFECT_TURN_DURATION_KEY] = ARBITRARY_TURN_DURATION;
					const effect = createArbitraryBaseEffect(valuesInEffect);
					const expectedValues = filteredPairs.reduce((acc, [, buffProp]) => {
						acc[buffProp] = buffProp !== 'affectsElement' ? 123 : true;
						return acc;
					}, {});
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						duration: ARBITRARY_TURN_DURATION,
						value: expectedValues,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('defaults [effectProp:dot unit index] to 0 if it is missing from effect and params property does not exist', () => {
				const filteredPairs = effectBuffKeyPairs
					.filter(([prop]) => prop !== 'dot unit index');
				const valuesInEffect = filteredPairs.reduce((acc, [localEffectProp, buffProp]) => {
					acc[localEffectProp] = buffProp !== 'affectsElement' ? 123 : true;
					return acc;
				}, {});
				valuesInEffect[EFFECT_TURN_DURATION_KEY] = ARBITRARY_TURN_DURATION;
				const effect = createArbitraryBaseEffect(valuesInEffect);
				const expectedValues = effectBuffKeyPairs.reduce((acc, [, buffProp]) => {
					if (buffProp === 'unitIndex') {
						acc[buffProp] = 0;
					} else {
						acc[buffProp] = buffProp !== 'affectsElement' ? 123 : true;
					}
					return acc;
				}, {});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: ARBITRARY_TURN_DURATION,
					value: expectedValues,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('defaults [effectProp:dot element affected] to false if it is missing from effect and params property does not exist', () => {
				const filteredPairs = effectBuffKeyPairs
					.filter(([prop]) => prop !== 'dot element affected');
				const valuesInEffect = filteredPairs.reduce((acc, [localEffectProp]) => {
					acc[localEffectProp] = 123;
					return acc;
				}, {});
				valuesInEffect[EFFECT_TURN_DURATION_KEY] = ARBITRARY_TURN_DURATION;
				const effect = createArbitraryBaseEffect(valuesInEffect);
				const expectedValues = effectBuffKeyPairs.reduce((acc, [, buffProp]) => {
					acc[buffProp] = buffProp !== 'affectsElement' ? 123 : false;
					return acc;
				}, {});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: ARBITRARY_TURN_DURATION,
					value: expectedValues,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff when all effect properties are non-number values', () => {
				const valuesInEffect = Object.keys(effectPropToResultPropMapping)
					.reduce((acc, prop) => {
						acc[prop] = 'not a number';
						return acc;
					}, {});
				const effect = createArbitraryBaseEffect({
					...valuesInEffect,
					[EFFECT_TURN_DURATION_KEY]: 'not a number',
				});
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});

			it('returns a no params buff when the effect params are non-number or missing', () => {
				const effect = createArbitraryBaseEffect({ params: 'non-number' });
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});
		});

		describe('when all non-turn values are 0', () => {
			testTurnDurationScenarios({
				getMappingFunction: () => mappingFunction,
				getBaseBuffFactory: () => baseBuffFactory,
				createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,${duration}`,
				buffIdsInTurnDurationBuff: [expectedBuffId],
			});
		});
	});

	describe('proc 45', () => {
		const BURST_TYPES = ['bb', 'sbb', 'ubb'];
		const EFFECT_TURN_DURATION_KEY = 'buff turns (72)';
		const expectedOriginalId = '45';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds(BURST_TYPES.map((type) => `proc:45:attack boost-${type}`));

		it('uses the params property when it exists', () => {
			const params = `1,2,3,${ARBITRARY_TURN_DURATION}`;
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = BURST_TYPES.map((type, index) => {
				return baseBuffFactory({
					id: `proc:45:attack boost-${type}`,
					duration: ARBITRARY_TURN_DURATION,
					value: +splitParams[index],
				});
			});

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = `1,2,3,${ARBITRARY_TURN_DURATION},5,6,7`;
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = BURST_TYPES.map((type, index) => {
				return baseBuffFactory({
					id: `proc:45:attack boost-${type}`,
					duration: ARBITRARY_TURN_DURATION,
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
			const mockValues = [5, 6, 7];
			const valuesInEffect = BURST_TYPES.reduce((acc, type, index) => {
				acc[`${type} atk% buff`] = mockValues[index];
				return acc;
			}, {});
			valuesInEffect[EFFECT_TURN_DURATION_KEY] = ARBITRARY_TURN_DURATION;
			const effect = createArbitraryBaseEffect(valuesInEffect);
			const expectedResult = BURST_TYPES.map((type, index) => {
				return baseBuffFactory({
					id: `proc:45:attack boost-${type}`,
					duration: ARBITRARY_TURN_DURATION,
					value: mockValues[index],
				});
			});

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('parses effect properties as numbers when params property does not exist', () => {
			const mockValues = [9, 10, 11];
			const valuesInEffect = BURST_TYPES.reduce((acc, type, index) => {
				acc[`${type} atk% buff`] = `${mockValues[index]}`;
				return acc;
			}, {});
			valuesInEffect[EFFECT_TURN_DURATION_KEY] = `${ARBITRARY_TURN_DURATION}`;
			const effect = createArbitraryBaseEffect(valuesInEffect);
			const expectedResult = BURST_TYPES.map((type, index) => {
				return baseBuffFactory({
					id: `proc:45:attack boost-${type}`,
					duration: ARBITRARY_TURN_DURATION,
					value: mockValues[index],
				});
			});

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		BURST_TYPES.forEach((burstCase) => {
			it(`returns only value for ${burstCase} if it is non-zero and other non-turn values are 0`, () => {
				const params = [...BURST_TYPES.map((type) => type === burstCase ? '123' : '0'), ARBITRARY_TURN_DURATION].join(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: `proc:45:attack boost-${burstCase}`,
					duration: ARBITRARY_TURN_DURATION,
					value: 123,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it(`returns only value for ${burstCase} if it is non-zero and other non-turn values are 0 when params property does not exist`, () => {
				const effect = createArbitraryBaseEffect({
					[`${burstCase} atk% buff`]: 456,
					[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
				});
				const expectedResult = [baseBuffFactory({
					id: `proc:45:attack boost-${burstCase}`,
					duration: ARBITRARY_TURN_DURATION,
					value: 456,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});
		});

		describe('when all stats are 0', () => {
			testTurnDurationScenarios({
				getMappingFunction: () => mappingFunction,
				getBaseBuffFactory: () => baseBuffFactory,
				createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,${duration}`,
				buffIdsInTurnDurationBuff: BURST_TYPES.map((type) => `proc:45:attack boost-${type}`),
			});
		});
	});

	describe('proc 46', () => {
		const expectedBuffId = 'proc:46:non-lethal proportional attack';
		const expectedOriginalId = '46';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffId]);

		it('uses the params property when it exists', () => {
			const params = '1,2';
			const effect = createArbitraryBaseEffect({ params });
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: {
					'hpDamageLow%': 1,
					'hpDamageHigh%': 2,
					hits: ARBITRARY_HIT_COUNT,
					distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			})];

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = '1,2,3,4,5';
			const effect = createArbitraryBaseEffect({ params });
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			});
			const expectedResult = [
				baseBuffFactory({
					id: expectedBuffId,
					value: {
						'hpDamageLow%': 1,
						'hpDamageHigh%': 2,
						hits: ARBITRARY_HIT_COUNT,
						distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
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

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		it('falls back to unknown proc params property when params property does not exist', () => {
			const params = '3,4';
			const effect = createArbitraryBaseEffect({ 'unknown proc param': params });
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: {
					'hpDamageLow%': 3,
					'hpDamageHigh%': 4,
					hits: ARBITRARY_HIT_COUNT,
					distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			})];

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		testMissingDamageFramesScenarios({ expectedBuffId, getMappingFunction: () => mappingFunction, getBaseBuffFactory: () => baseBuffFactory });

		describe('when values are missing', () => {
			it('defaults to 0 for hpDamageLow% if it is missing', () => {
				const params = ',123';
				const effect = createArbitraryBaseEffect({ params });
				const context = createArbitraryContext({
					damageFrames: {
						hits: ARBITRARY_HIT_COUNT,
						[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
					},
				});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						'hpDamageLow%': 0,
						'hpDamageHigh%': 123,
						hits: ARBITRARY_HIT_COUNT,
						distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
					},
				})];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			it('defaults to 0 for hpDamageHigh% if it is missing', () => {
				const params = '123';
				const effect = createArbitraryBaseEffect({ params });
				const context = createArbitraryContext({
					damageFrames: {
						hits: ARBITRARY_HIT_COUNT,
						[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
					},
				});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						'hpDamageLow%': 123,
						'hpDamageHigh%': 0,
						hits: ARBITRARY_HIT_COUNT,
						distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
					},
				})];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});
		});
	});

	describe('proc 47', () => {
		const PROPORTIONAL_MODE_BUFF_KEY = 'proportionalMode';
		const ADDED_ATK_BUFF_KEY = 'maxAddedAtk%';
		const PARAMS_ORDER = ['baseAtk%', ADDED_ATK_BUFF_KEY, PROPORTIONAL_MODE_BUFF_KEY, 'flatAtk', 'crit%', 'bc%', 'hc%', 'dmg%'];
		const expectedBuffId = 'proc:47:hp scaled attack';
		const expectedOriginalId = '47';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffId]);

		it('uses the params property when it exists', () => {
			const params = '1,200,3,4,5,6,7,8';
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			});
			const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
				let valueToSet;
				if (param === PROPORTIONAL_MODE_BUFF_KEY) {
					valueToSet = 'remaining';
				} else if (param === ADDED_ATK_BUFF_KEY) {
					valueToSet = 199; // second parameter minus first parameter
				} else {
					valueToSet = +splitParams[index];
				}
				acc[param] = valueToSet;
				return acc;
			}, {});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: {
					...expectedValuesForParams,
					hits: ARBITRARY_HIT_COUNT,
					distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			})];

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = '1,200,3,4,5,6,7,8,9,10,11';
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			});
			const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
				let valueToSet;
				if (param === PROPORTIONAL_MODE_BUFF_KEY) {
					valueToSet = 'remaining';
				} else if (param === ADDED_ATK_BUFF_KEY) {
					valueToSet = 199; // second parameter minus first parameter
				} else {
					valueToSet = +splitParams[index];
				}
				acc[param] = valueToSet;
				return acc;
			}, {});
			const expectedResult = [
				baseBuffFactory({
					id: expectedBuffId,
					value: {
						...expectedValuesForParams,
						hits: ARBITRARY_HIT_COUNT,
						distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
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
				let valueToSet = mockValues[index];
				if (stat === 'flatAtk') {
					key = 'bb flat atk';
				} else if (stat === 'baseAtk%') {
					key = 'bb base atk%';
				} else if (stat === ADDED_ATK_BUFF_KEY) {
					key = 'bb added atk% based on hp';
				} else if (stat === PROPORTIONAL_MODE_BUFF_KEY) {
					key = 'bb added atk% proportional to hp';
					valueToSet = 'arbitrary proportional value'; // taken at face value
				} else {
					key = `bb ${stat}`;
				}
				acc[key] = valueToSet;
				return acc;
			}, {});
			const effect = createArbitraryBaseEffect(valuesInEffect);
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			});
			const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
				let valueToSet;
				if (param === PROPORTIONAL_MODE_BUFF_KEY) {
					valueToSet = 'arbitrary proportional value';
				} else {
					valueToSet = mockValues[index];
				}
				acc[param] = valueToSet;
				return acc;
			}, {});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: {
					...expectedValuesForParams,
					hits: ARBITRARY_HIT_COUNT,
					distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			})];

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		testMissingDamageFramesScenarios({
			getMappingFunction: () => mappingFunction,
			getBaseBuffFactory: () => baseBuffFactory,
			expectedBuffId,
			updateExpectedBuffForOnlyHitsOrDistributionCase: (buff) => {
				buff.value.proportionalMode = 'unknown';
			},
		});

		PARAMS_ORDER.forEach((paramCase) => {
			if (paramCase !== PROPORTIONAL_MODE_BUFF_KEY) {
				it(`returns associated values for ${paramCase} if it is non-zero and other stats are zero`, () => {
					const params = PARAMS_ORDER.map((param) => param === paramCase ? '123' : '0').join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							[paramCase]: 123,
							proportionalMode: 'remaining',
							hits: 0,
							distribution: 0,
						},
					})];
					if (paramCase === 'baseAtk%') {
						expectedResult[0].value[ADDED_ATK_BUFF_KEY] = -123;
					}

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`returns associated values for ${paramCase} if it is non-zero and other stats are zero and params property does not exist`, () => {
					const valuesInEffect = PARAMS_ORDER.reduce((acc, stat) => {
						let key;
						let valueToSet = stat === paramCase ? 789 : 0;
						if (stat === 'flatAtk') {
							key = 'bb flat atk';
						} else if (stat === 'baseAtk%') {
							key = 'bb base atk%';
						} else if (stat === ADDED_ATK_BUFF_KEY) {
							key = 'bb added atk% based on hp';
						} else if (stat === PROPORTIONAL_MODE_BUFF_KEY) {
							key = 'bb added atk% proportional to hp';
							valueToSet = 'arbitrary value';
						} else {
							key = `bb ${stat}`;
						}
						acc[key] = valueToSet;
						return acc;
					}, {});
					const effect = createArbitraryBaseEffect(valuesInEffect);
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							[paramCase]: 789,
							proportionalMode: 'arbitrary value',
							hits: 0,
							distribution: 0,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			}
		});

		describe('for proportional mode parsing', () => {
			it('returns "lost" for proportional mode if param for it is 1', () => {
				const params = '0,2,1,0,0,0,0,0';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						[ADDED_ATK_BUFF_KEY]: 2,
						[PROPORTIONAL_MODE_BUFF_KEY]: 'lost',
						hits: 0,
						distribution: 0,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns "unknown" if value for proportional mode in effect is missing when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({ 'bb added atk% based on hp': 123 });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						[ADDED_ATK_BUFF_KEY]: 123,
						[PROPORTIONAL_MODE_BUFF_KEY]: 'unknown',
						hits: 0,
						distribution: 0,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});
		});
	});

	describe('proc 48', () => {
		const HP_DAMAGE_LOW_BUFF_KEY = 'hpDamageLow%';
		const HP_DAMAGE_HIGH_BUFF_KEY = 'hpDamageHigh%';
		const ATTACK_TYPES = {
			BASE: 'base',
			CURRENT: 'current',
			FIXED: 'fixed',
			UNKNOWN: 'unknown',
		};
		const expectedOriginalId = '48';

		/**
		 * @param {'base'|'current'|'fixed'|'unknown'} type see `ATTACK_TYPES` constant
		 * @param {{ low: number, high: number }|number} damageValue
		 * @param {{object}} attackParams
		 * @returns {import('./buff-types').IBuff}
		 */
		const generateExpectedBuffForAttackTypeAndValues = (type, damageValue, attackParams) => {
			const valuesInBuff = {
				id: `proc:48:piercing attack-${type}`,
				value: {
					hits: ARBITRARY_HIT_COUNT,
					distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
					...attackParams,
				},
			};
			if (type === 'base' || type === 'current') {
				valuesInBuff.value = {
					...valuesInBuff.value,
					[HP_DAMAGE_LOW_BUFF_KEY]: damageValue.low,
					[HP_DAMAGE_HIGH_BUFF_KEY]: damageValue.high,
				};
			} else if (type === 'fixed') {
				valuesInBuff.value.value = damageValue;
			}

			return baseBuffFactory(valuesInBuff);
		};

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([ATTACK_TYPES.BASE, ATTACK_TYPES.CURRENT, ATTACK_TYPES.FIXED, ATTACK_TYPES.UNKNOWN].map((type) => `proc:48:piercing attack-${type}`));

		it('uses the params property when it exists', () => {
			const params = '1,2,3,4,5,6,7';
			const effect = createArbitraryBaseEffect({ params });
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			});
			const expectedSharedValues = {
				chance: 6,
				isLethal: false,
			};
			const expectedResult = [
				generateExpectedBuffForAttackTypeAndValues(ATTACK_TYPES.BASE, { low: 1, high: 2 }, expectedSharedValues),
				generateExpectedBuffForAttackTypeAndValues(ATTACK_TYPES.CURRENT, { low: 3, high: 4 }, expectedSharedValues),
				generateExpectedBuffForAttackTypeAndValues(ATTACK_TYPES.FIXED, 5, expectedSharedValues),
			];

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = '1,2,3,4,5,6,7,8,9,10';
			const effect = createArbitraryBaseEffect({ params });
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			});
			const expectedSharedValues = {
				chance: 6,
				isLethal: false,
			};
			const expectedResult = [
				generateExpectedBuffForAttackTypeAndValues(ATTACK_TYPES.BASE, { low: 1, high: 2 }, expectedSharedValues),
				generateExpectedBuffForAttackTypeAndValues(ATTACK_TYPES.CURRENT, { low: 3, high: 4 }, expectedSharedValues),
				generateExpectedBuffForAttackTypeAndValues(ATTACK_TYPES.FIXED, 5, expectedSharedValues),
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

		it('falls back to unknown proc params property when params property does not exist', () => {
			const params = '1,2,3,4,5,6,7';
			const effect = createArbitraryBaseEffect({ 'unknown proc param': params });
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			});
			const expectedSharedValues = {
				chance: 6,
				isLethal: false,
			};
			const expectedResult = [
				generateExpectedBuffForAttackTypeAndValues(ATTACK_TYPES.BASE, { low: 1, high: 2 }, expectedSharedValues),
				generateExpectedBuffForAttackTypeAndValues(ATTACK_TYPES.CURRENT, { low: 3, high: 4 }, expectedSharedValues),
				generateExpectedBuffForAttackTypeAndValues(ATTACK_TYPES.FIXED, 5, expectedSharedValues),
			];

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		describe('when values are missing', () => {
			describe('and only one of the attack parameters are given', () => {
				/**
				 * @type {import('./_helpers').IProcBuffProcessingInjectionContext}
				 */
				let context;
				const EXPECTED_SHARED_VALUES = {
					chance: 0,
					isLethal: false,
				};

				beforeEach(() => {
					context = createArbitraryContext({
						damageFrames: {
							hits: ARBITRARY_HIT_COUNT,
							[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
						},
					});
				});

				it('returns attack entry for base if only its low parameter is non-zero', () => {
					const params = '123,0,0,0,0,0,0';
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [
						generateExpectedBuffForAttackTypeAndValues(ATTACK_TYPES.BASE, { low: 123, high: 0 }, EXPECTED_SHARED_VALUES),
					];

					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});

				it('returns attack entry for base if only its high parameter is non-zero', () => {
					const params = '0,123,0,0,0,0,0';
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [
						generateExpectedBuffForAttackTypeAndValues(ATTACK_TYPES.BASE, { low: 0, high: 123 }, EXPECTED_SHARED_VALUES),
					];

					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});

				it('returns attack entry for current if only its low parameter is non-zero', () => {
					const params = '0,0,123,0,0,0,0';
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [
						generateExpectedBuffForAttackTypeAndValues(ATTACK_TYPES.CURRENT, { low: 123, high: 0 }, EXPECTED_SHARED_VALUES),
					];

					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});

				it('returns attack entry for current if only its high parameter is non-zero', () => {
					const params = '0,0,0,123,0,0,0';
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [
						generateExpectedBuffForAttackTypeAndValues(ATTACK_TYPES.CURRENT, { low: 0, high: 123 }, EXPECTED_SHARED_VALUES),
					];

					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});

				it('returns attack entry for fixed if only its parameter is non-zero', () => {
					const params = '0,0,0,0,123,0,0';
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [
						generateExpectedBuffForAttackTypeAndValues(ATTACK_TYPES.FIXED, 123, EXPECTED_SHARED_VALUES),
					];

					const result = mappingFunction(effect, context);
					expect(result).toEqual(expectedResult);
				});
			});

			it('returns an attack entry for unknown if no are given but hits and distribution are given', () => {
				const params = '0,0,0,0,0,0,0';
				const effect = createArbitraryBaseEffect({ params });
				const context = createArbitraryContext({
					damageFrames: {
						hits: ARBITRARY_HIT_COUNT,
						[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
					},
				});
				const expectedResult = [
					generateExpectedBuffForAttackTypeAndValues(ATTACK_TYPES.UNKNOWN, void 0, { chance: 0, isLethal: false }),
				];

				const result = mappingFunction(effect, context);
				expect(result).toEqual(expectedResult);
			});

			describe('no attack parameters are given and for missing parts of context.damageFrames', () => {
				it('returns a no params buff if context.damageFrames does not exist and no other parameters are specified', () => {
					expectNoParamsBuffWithEffectAndContext({ effect: createArbitraryBaseEffect(), context: createArbitraryContext(), mappingFunction, baseBuffFactory });
				});

				it('defaults to 0 for hits if context.damageFrames.hits does not exist', () => {
					const context = createArbitraryContext({
						damageFrames: {
							[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
						},
					});
					const expectedResult = [
						generateExpectedBuffForAttackTypeAndValues(ATTACK_TYPES.UNKNOWN, void 0, { chance: 0, isLethal: false, hits: 0 }),
					];

					const result = mappingFunction(createArbitraryBaseEffect(), context);
					expect(result).toEqual(expectedResult);
				});

				it('defaults to 0 for distribution if context.damageFrames["hit dmg% distribution (total)"] does not exist', () => {
					const context = createArbitraryContext({
						damageFrames: {
							hits: ARBITRARY_HIT_COUNT,
						},
					});
					const expectedResult = [
						generateExpectedBuffForAttackTypeAndValues(ATTACK_TYPES.UNKNOWN, void 0, { chance: 0, isLethal: false, distribution: 0 }),
					];

					const result = mappingFunction(createArbitraryBaseEffect(), context);
					expect(result).toEqual(expectedResult);
				});
			});
		});

		it('returns attacks with isLethal being true if parameter for it is 1', () => {
			const params = '8,9,10,11,12,13,1';
			const effect = createArbitraryBaseEffect({ params });
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			});
			const expectedSharedValues = {
				chance: 13,
				isLethal: true,
			};
			const expectedResult = [
				generateExpectedBuffForAttackTypeAndValues(ATTACK_TYPES.BASE, { low: 8, high: 9 }, expectedSharedValues),
				generateExpectedBuffForAttackTypeAndValues(ATTACK_TYPES.CURRENT, { low: 10, high: 11 }, expectedSharedValues),
				generateExpectedBuffForAttackTypeAndValues(ATTACK_TYPES.FIXED, 12, expectedSharedValues),
			];

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});
	});

	describe('proc 49', () => {
		const expectedBuffId = 'proc:49:chance instant death';
		const expectedOriginalId = '49';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffId]);

		it('uses the params property when it exists', () => {
			const params = '1';
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: 1,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = '5,2,3,4';
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: expectedBuffId,
					value: 5,
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

		it('falls back to unknown proc params property when params property does not exist', () => {
			const params = '2';
			const effect = createArbitraryBaseEffect({ 'unknown proc param': params });
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: 2,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a no params buff when no parameters are given', () => {
			const effect = createArbitraryBaseEffect();
			expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
		});

		it('returns a no params buff if chance is 0', () => {
			const effect = createArbitraryBaseEffect({ params: '0' });
			expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
		});
	});

	describe('proc 50', () => {
		const DAMAGE_REFLECT_LOW_BUFF_KEY = 'reflectedDamageLow%';
		const DAMAGE_REFLECT_HIGH_BUFF_KEY = 'reflectedDamageHigh%';
		const expectedBuffId = 'proc:50:chance damage reflect';
		const expectedOriginalId = '50';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffId]);

		it('uses the params property when it exists', () => {
			const params = `1,2,3,${ARBITRARY_TURN_DURATION}`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				duration: ARBITRARY_TURN_DURATION,
				value: {
					[DAMAGE_REFLECT_LOW_BUFF_KEY]: 1,
					[DAMAGE_REFLECT_HIGH_BUFF_KEY]: 2,
					chance: 3,
				},
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = `1,2,3,${ARBITRARY_TURN_DURATION},5,6,7`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: expectedBuffId,
					duration: ARBITRARY_TURN_DURATION,
					value: {
						[DAMAGE_REFLECT_LOW_BUFF_KEY]: 1,
						[DAMAGE_REFLECT_HIGH_BUFF_KEY]: 2,
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

		it('falls back to unknown proc params property when params property does not exist', () => {
			const params = `5,6,7,${ARBITRARY_TURN_DURATION}`;
			const effect = createArbitraryBaseEffect({ 'unknown proc param': params });
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				duration: ARBITRARY_TURN_DURATION,
				value: {
					[DAMAGE_REFLECT_LOW_BUFF_KEY]: 5,
					[DAMAGE_REFLECT_HIGH_BUFF_KEY]: 6,
					chance: 7,
				},
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when values are missing', () => {
			it('returns a buff if only the low damage parameter is non-zero', () => {
				const params = '123,0,0,0';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 0,
					value: {
						[DAMAGE_REFLECT_LOW_BUFF_KEY]: 123,
						[DAMAGE_REFLECT_HIGH_BUFF_KEY]: 0,
						chance: 0,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a buff if only the high damage parameter is non-zero', () => {
				const params = '0,123,0,0';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: 0,
					value: {
						[DAMAGE_REFLECT_LOW_BUFF_KEY]: 0,
						[DAMAGE_REFLECT_HIGH_BUFF_KEY]: 123,
						chance: 0,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff if the damage parameter range is 0 and turn duration is 0', () => {
				const effect = createArbitraryBaseEffect({ params: '0,0,123,0' });
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});

			it('returns a no params buff if the effect params are non-number or missing', () => {
				const effect = createArbitraryBaseEffect({ params: 'non-number' });
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});

			describe('and non-turn duration values are 0', () => {
				testTurnDurationScenarios({
					getMappingFunction: () => mappingFunction,
					getBaseBuffFactory: () => baseBuffFactory,
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,${duration}`,
					buffIdsInTurnDurationBuff: [expectedBuffId],
				});
			});
		});
	});
});
