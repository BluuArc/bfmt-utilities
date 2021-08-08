const { UnitElement } = require('../../datamine-types');
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
});
