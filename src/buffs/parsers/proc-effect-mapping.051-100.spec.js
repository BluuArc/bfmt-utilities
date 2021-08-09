const { Ailment, TargetArea, TargetType } = require('../../datamine-types');
const { ARBITRARY_TURN_DURATION, NON_ZERO_ELEMENT_MAPPING, EFFECT_DELAY_BUFF_PROP, ARBITRARY_HIT_COUNT, ARBITRARY_DAMAGE_DISTRIBUTION, HIT_DMG_DISTRIBUTION_TOTAL_KEY, ELEMENT_MAPPING } = require('../../_test-helpers/constants');
const { createFactoryForBaseBuffFromArbitraryEffect, testFunctionExistence, testValidBuffIds, createArbitraryBaseEffect, createArbitraryContext, testTurnDurationScenarios, testProcWithSingleNumericalParameterAndTurnDuration, expectNoParamsBuffWithEffectAndContext, testMissingDamageFramesScenarios, testProcWithNumericalValueRangeAndChanceAndTurnDuration } = require('../../_test-helpers/proc-effect-mapping.utils');
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

	describe('proc 51', () => {
		const expectedOriginalId = '51';
		const AILMENTS_ORDER = ['atk', 'def', 'rec'];
		const EFFECT_KEY_VALUE_MAPPING = {
			atk: 'inflict atk% debuff (2)',
			def: 'inflict def% debuff (4)',
			rec: 'inflict rec% debuff (6)',
		};
		const EFFECT_KEY_CHANCE_MAPPING = {
			atk: 'inflict atk% debuff chance% (74)',
			def: 'inflict def% debuff chance% (75)',
			rec: 'inflict rec% debuff chance% (76)',
		};
		const DEBUFF_TURN_EFFECT_KEY = 'stat% debuff turns';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds(AILMENTS_ORDER.map((a) => `proc:51:add to attack-${a} down`));

		it('uses the params property when it exists', () => {
			const params = `1,2,3,4,5,6,7,${ARBITRARY_TURN_DURATION}`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: 'proc:51:add to attack-atk down',
					duration: ARBITRARY_TURN_DURATION,
					value: {
						reductionValue: 1,
						chance: 4,
						debuffTurnDuration: 7,
					},
				}),
				baseBuffFactory({
					id: 'proc:51:add to attack-def down',
					duration: ARBITRARY_TURN_DURATION,
					value: {
						reductionValue: 2,
						chance: 5,
						debuffTurnDuration: 7,
					},
				}),
				baseBuffFactory({
					id: 'proc:51:add to attack-rec down',
					duration: ARBITRARY_TURN_DURATION,
					value: {
						reductionValue: 3,
						chance: 6,
						debuffTurnDuration: 7,
					},
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = `1,2,3,4,5,6,7,${ARBITRARY_TURN_DURATION},9,10,11`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: 'proc:51:add to attack-atk down',
					duration: ARBITRARY_TURN_DURATION,
					value: {
						reductionValue: 1,
						chance: 4,
						debuffTurnDuration: 7,
					},
				}),
				baseBuffFactory({
					id: 'proc:51:add to attack-def down',
					duration: ARBITRARY_TURN_DURATION,
					value: {
						reductionValue: 2,
						chance: 5,
						debuffTurnDuration: 7,
					},
				}),
				baseBuffFactory({
					id: 'proc:51:add to attack-rec down',
					duration: ARBITRARY_TURN_DURATION,
					value: {
						reductionValue: 3,
						chance: 6,
						debuffTurnDuration: 7,
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

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[EFFECT_KEY_VALUE_MAPPING.atk]: 1,
				[EFFECT_KEY_CHANCE_MAPPING.atk]: 2,
				[EFFECT_KEY_VALUE_MAPPING.def]: 3,
				[EFFECT_KEY_CHANCE_MAPPING.def]: 4,
				[EFFECT_KEY_VALUE_MAPPING.rec]: 5,
				[EFFECT_KEY_CHANCE_MAPPING.rec]: 6,
				[DEBUFF_TURN_EFFECT_KEY]: 7,
				[DEFAULT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
			});
			const expectedResult = [
				baseBuffFactory({
					id: 'proc:51:add to attack-atk down',
					duration: ARBITRARY_TURN_DURATION,
					value: {
						reductionValue: 1,
						chance: 2,
						debuffTurnDuration: 7,
					},
				}),
				baseBuffFactory({
					id: 'proc:51:add to attack-def down',
					duration: ARBITRARY_TURN_DURATION,
					value: {
						reductionValue: 3,
						chance: 4,
						debuffTurnDuration: 7,
					},
				}),
				baseBuffFactory({
					id: 'proc:51:add to attack-rec down',
					duration: ARBITRARY_TURN_DURATION,
					value: {
						reductionValue: 5,
						chance: 6,
						debuffTurnDuration: 7,
					},
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when values are 0 or missing', () => {
			AILMENTS_ORDER.forEach((type) => {
				it(`returns an entry for ${type} when its reduction value is the only non-zero value of the individual reduction properties`, () => {
					const params = [
						type === 'atk' ? '123' : '0',
						type === 'def' ? '123' : '0',
						type === 'rec' ? '123' : '0',
						'0,0,0', // chance values of 0
						'0',
						ARBITRARY_TURN_DURATION,
					].join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: `proc:51:add to attack-${type} down`,
						duration: ARBITRARY_TURN_DURATION,
						value: {
							reductionValue: 123,
							chance: 0,
							debuffTurnDuration: 0,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`returns an entry for ${type} when its reduction chance is the only non-zero value of the individual reduction properties`, () => {
					const params = [
						'0,0,0', // reduction values of 0
						type === 'atk' ? '123' : '0',
						type === 'def' ? '123' : '0',
						type === 'rec' ? '123' : '0',
						'0',
						ARBITRARY_TURN_DURATION,
					].join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: `proc:51:add to attack-${type} down`,
						duration: ARBITRARY_TURN_DURATION,
						value: {
							reductionValue: 0,
							chance: 123,
							debuffTurnDuration: 0,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`returns an entry for ${type} when its reduction value is the only non-zero value of the individual reduction properties and the params property does not exist`, () => {
					const effect = createArbitraryBaseEffect({
						[EFFECT_KEY_VALUE_MAPPING[type]]: 456,
						[DEFAULT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
					});
					const expectedResult = [baseBuffFactory({
						id: `proc:51:add to attack-${type} down`,
						duration: ARBITRARY_TURN_DURATION,
						value: {
							reductionValue: 456,
							chance: 0,
							debuffTurnDuration: 0,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`returns an entry for ${type} when its reduction chance is the only non-zero value of the individual reduction properties`, () => {
					const effect = createArbitraryBaseEffect({
						[EFFECT_KEY_CHANCE_MAPPING[type]]: 456,
						[DEFAULT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
					});
					const expectedResult = [baseBuffFactory({
						id: `proc:51:add to attack-${type} down`,
						duration: ARBITRARY_TURN_DURATION,
						value: {
							reductionValue: 0,
							chance: 456,
							debuffTurnDuration: 0,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			describe('for buff duration', () => {
				testTurnDurationScenarios({
					getMappingFunction: () => mappingFunction,
					getBaseBuffFactory: () => baseBuffFactory,
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,0,0,${duration}`,
					buffIdsInTurnDurationBuff: AILMENTS_ORDER.map((a) => `proc:51:add to attack-${a} down`),
					modifyTurnDurationBuff: (buff) => {
						buff.value.debuffTurnDuration = 0;
					},
				});
			});

			describe('for debuff duration', () => {
				testTurnDurationScenarios({
					getMappingFunction: () => mappingFunction,
					getBaseBuffFactory: () => baseBuffFactory,
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,0,${duration},0`,
					buffIdsInTurnDurationBuff: AILMENTS_ORDER.map((a) => `proc:51:add to attack-${a} down`),
					modifyTurnDurationBuff: (buff) => {
						buff.value.debuffTurnDuration = buff.value.duration;
						buff.value.duration = 0;
					},
				});
			});
		});
	});

	describe('proc 52', () => {
		const expectedOriginalId = '52';
		testProcWithSingleNumericalParameterAndTurnDuration({
			getMappingFunction: () => getProcEffectToBuffMapping().get(expectedOriginalId),
			getBaseBuffFactory: () => createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId),
			expectedOriginalId,
			expectedBuffId: 'proc:52:bc efficacy',
			effectValueKey: 'bb gauge fill rate% buff',
			effectTurnDurationKey: 'buff turns (77)',
		});
	});

	describe('proc 53', () => {
		const AILMENTS_ORDER = [Ailment.Poison, Ailment.Weak, Ailment.Sick, Ailment.Injury, Ailment.Curse, Ailment.Paralysis];
		const EFFECT_TURN_DURATION_KEY = 'counter inflict ailment turns';
		const expectedOriginalId = '53';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds(AILMENTS_ORDER.map((ailment) => `proc:53:inflict on hit-${ailment}`));

		it('uses the params property when it exists', () => {
			const params = `1,2,3,4,5,6,${ARBITRARY_TURN_DURATION}`;
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
				return baseBuffFactory({
					id: `proc:53:inflict on hit-${ailment}`,
					duration: ARBITRARY_TURN_DURATION,
					value: +splitParams[index],
					conditions: { whenAttacked: true },
				});
			});

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = `1,2,3,4,5,6,${ARBITRARY_TURN_DURATION},8,9,10`;
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
				return baseBuffFactory({
					id: `proc:53:inflict on hit-${ailment}`,
					duration: ARBITRARY_TURN_DURATION,
					value: +splitParams[index],
					conditions: { whenAttacked: true },
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
				'counter inflict poison% (78)': 7, // the numbers here are from actual data; separate unit tests handle more arbitrary cases
				'counter inflict weaken% (79)': 8,
				'counter inflict sick% (80)': 9,
				'counter inflict injury% (81)': 10,
				'counter inflict curse% (82)': 11,
				'counter inflict paralysis% (83)': 12,
				[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
			});
			const expectedParamValues = [7, 8, 9, 10, 11, 12];
			const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
				return baseBuffFactory({
					id: `proc:53:inflict on hit-${ailment}`,
					duration: ARBITRARY_TURN_DURATION,
					value: expectedParamValues[index],
					conditions: { whenAttacked: true },
				});
			});

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		AILMENTS_ORDER.forEach((ailmentCase) => {
			it(`returns only value for ${ailmentCase} if it is non-zero and other stats are zero`, () => {
				const params = AILMENTS_ORDER.map((ailment) => ailment === ailmentCase ? '123' : '0').concat([ARBITRARY_TURN_DURATION]).join(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: `proc:53:inflict on hit-${ailmentCase}`,
					duration: ARBITRARY_TURN_DURATION,
					value: 123,
					conditions: { whenAttacked: true },
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it(`returns only value for ${ailmentCase} if it is non-zero and other stats are zero and params property does not exist`, () => {
				const ailmentKey = ailmentCase !== Ailment.Weak ? ailmentCase : 'weaken';
				const effect = createArbitraryBaseEffect({
					[`counter inflict ${ailmentKey}% (${Math.floor(Math.random() * 100)})`]: 123,
					[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
				});
				const expectedResult = [baseBuffFactory({
					id: `proc:53:inflict on hit-${ailmentCase}`,
					duration: ARBITRARY_TURN_DURATION,
					value: 123,
					conditions: { whenAttacked: true },
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});
		});

		describe('when all resistances are 0', () => {
			testTurnDurationScenarios({
				getMappingFunction: () => mappingFunction,
				getBaseBuffFactory: () => baseBuffFactory,
				createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,0,${duration}`,
				buffIdsInTurnDurationBuff: AILMENTS_ORDER.map((ailment) => `proc:53:inflict on hit-${ailment}`),
			});
		});
	});

	describe('proc 54', () => {
		const expectedOriginalId = '54';
		testProcWithSingleNumericalParameterAndTurnDuration({
			getMappingFunction: () => getProcEffectToBuffMapping().get(expectedOriginalId),
			getBaseBuffFactory: () => createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId),
			expectedOriginalId,
			expectedBuffId: 'proc:54:critical damage boost',
			effectValueKey: 'crit multiplier%',
			effectTurnDurationKey: 'buff turns (84)',
			getExpectedValueFromParam: (param) => +param * 100,
		});
	});

	describe('proc 55', () => {
		const EFFECT_MULTIPLIER_KEY = 'elemental weakness multiplier%';
		const EFFECT_TURN_DURATION_KEY = 'elemental weakness buff turns';
		const expectedOriginalId = '55';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds(Object.values(NON_ZERO_ELEMENT_MAPPING).concat(['unknown']).map((element) => `proc:55:elemental weakness damage-${element}`));

		it('uses the params property when it exists', () => {
			const params = `1,2,3,4,5,6,7,${ARBITRARY_TURN_DURATION}`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = Object.values(NON_ZERO_ELEMENT_MAPPING).map((element) => {
				return baseBuffFactory({
					id: `proc:55:elemental weakness damage-${element}`,
					duration: ARBITRARY_TURN_DURATION,
					value: 700,
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
					id: `proc:55:elemental weakness damage-${element}`,
					duration: ARBITRARY_TURN_DURATION,
					value: 700,
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
				acc[`${element} units do extra elemental weakness dmg`] = true;
				return acc;
			}, {});
			valuesInEffect[EFFECT_MULTIPLIER_KEY] = 9;
			valuesInEffect[EFFECT_TURN_DURATION_KEY] = ARBITRARY_TURN_DURATION;
			const effect = createArbitraryBaseEffect(valuesInEffect);
			const expectedResult = Object.values(NON_ZERO_ELEMENT_MAPPING).map((element) => {
				return baseBuffFactory({
					id: `proc:55:elemental weakness damage-${element}`,
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
					id: `proc:55:elemental weakness damage-${elementValue}`,
					duration: ARBITRARY_TURN_DURATION,
					value: 12300,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it(`parses value for ${elementValue} when params property does not exist`, () => {
				const effect = createArbitraryBaseEffect({
					[`${elementValue} units do extra elemental weakness dmg`]: true,
					[EFFECT_MULTIPLIER_KEY]: 456,
					[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
				});
				const expectedResult = [baseBuffFactory({
					id: `proc:55:elemental weakness damage-${elementValue}`,
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
				id: 'proc:55:elemental weakness damage-unknown',
				duration: ARBITRARY_TURN_DURATION,
				value: 12300,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('parses lack of elements to "unknown" when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[EFFECT_MULTIPLIER_KEY]: 456,
				[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
			});
			const expectedResult = [baseBuffFactory({
				id: 'proc:55:elemental weakness damage-unknown',
				duration: ARBITRARY_TURN_DURATION,
				value: 456,
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when no damage boost value is given', () => {
			testTurnDurationScenarios({
				getMappingFunction: () => mappingFunction,
				getBaseBuffFactory: () => baseBuffFactory,
				createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,0,0,0,${duration}`,
				buffIdsInTurnDurationBuff: Object.values(NON_ZERO_ELEMENT_MAPPING).concat(['unknown']).map((stat) => `proc:55:elemental weakness damage-${stat}`),
			});

			it('returns a turn modification buff turn duration is non-zero and params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
				});
				const expectedResult = [baseBuffFactory({
					id: BuffId.TURN_DURATION_MODIFICATION,
					value: {
						buffs: Object.values(NON_ZERO_ELEMENT_MAPPING).concat(['unknown']).map((stat) => `proc:55:elemental weakness damage-${stat}`),
						duration: ARBITRARY_TURN_DURATION,
					},
				}, [EFFECT_DELAY_BUFF_PROP])];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});
		});
	});

	describe('proc 56', () => {
		const expectedBuffId = 'proc:56:chance ko resistance';
		const expectedOriginalId = '56';

		const RECOVERED_HP_BUFF_KEY = 'recoveredHp%';
		const EFFECT_KEY_MAPPING = {
			chance: 'angel idol recover chance%',
			'recoveredHp%': 'angel idol recover hp%',
			turnDuration: 'angel idol buff turns (91)',
		};

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffId]);

		it('uses the params property when it exists', () => {
			const params = `1,2,${ARBITRARY_TURN_DURATION}`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				duration: ARBITRARY_TURN_DURATION,
				value: { chance: 1, [RECOVERED_HP_BUFF_KEY]: 2 },
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});


		it('returns a buff entry for extra parameters', () => {
			const params = `1,2,${ARBITRARY_TURN_DURATION},4,5,6`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: expectedBuffId,
					duration: ARBITRARY_TURN_DURATION,
					value: { chance: 1, [RECOVERED_HP_BUFF_KEY]: 2 },
				}),
				baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
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

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[EFFECT_KEY_MAPPING.chance]: 4,
				[EFFECT_KEY_MAPPING['recoveredHp%']]: 5,
				[EFFECT_KEY_MAPPING.turnDuration]: ARBITRARY_TURN_DURATION,
			});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				duration: ARBITRARY_TURN_DURATION,
				value: { chance: 4, [RECOVERED_HP_BUFF_KEY]: 5 },
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when values are 0 or missing', () => {
			it('defaults to 0 for missing recovered HP parameter', () => {
				const params = `1,,${ARBITRARY_TURN_DURATION}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: ARBITRARY_TURN_DURATION,
					value: { chance: 1, [RECOVERED_HP_BUFF_KEY]: 0 },
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('defaults to 0 for missing recovered HP parameter when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[EFFECT_KEY_MAPPING.chance]: 4,
					[EFFECT_KEY_MAPPING.turnDuration]: ARBITRARY_TURN_DURATION,
				});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: ARBITRARY_TURN_DURATION,
					value: { chance: 4, [RECOVERED_HP_BUFF_KEY]: 0 },
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff if chance is 0 and turn duration is 0', () => {
				const params = '0,1,0';
				const effect = createArbitraryBaseEffect({ params });

				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});

			it('returns a no params buff if chance is 0 and turn duration is 0 and params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[EFFECT_KEY_MAPPING.chance]: 0,
					[EFFECT_KEY_MAPPING['recoveredHp%']]: 5,
					[EFFECT_KEY_MAPPING.turnDuration]: 0,
				});
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});

			testTurnDurationScenarios({
				getMappingFunction: () => mappingFunction,
				getBaseBuffFactory: () => baseBuffFactory,
				createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,${duration}`,
				buffIdsInTurnDurationBuff: [expectedBuffId],
			});
		});
	});

	describe('proc 57', () => {
		const BUFF_ID_MAPPING = {
			bcDropResistanceBase: 'proc:57:bc drop resistance-base',
			bcDropResistanceBuff: 'proc:57:bc drop resistance-buff',
			hcDropResistanceBase: 'proc:57:hc drop resistance-base',
			hcDropResistanceBuff: 'proc:57:hc drop resistance-buff',
		};
		const EFFECT_KEY_MAPPING = {
			bcDropResistanceBase: 'base bc drop% resist buff',
			bcDropResistanceBuff: 'buffed bc drop% resist buff',
			turnDuration: 'bc drop% resist buff turns (92)',
			// Deathmax's datamine doesn't parse HC resistance buffs
		};
		const PARAMS_ORDER = ['bcDropResistanceBase', 'bcDropResistanceBuff', 'hcDropResistanceBase', 'hcDropResistanceBuff'];
		const expectedOriginalId = '57';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds(PARAMS_ORDER.map((k) => BUFF_ID_MAPPING[k]));

		it('uses the params property when it exists', () => {
			const params = `1,2,3,4,${ARBITRARY_TURN_DURATION}`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: BUFF_ID_MAPPING.bcDropResistanceBase,
					duration: ARBITRARY_TURN_DURATION,
					value: 1,
				}),
				baseBuffFactory({
					id: BUFF_ID_MAPPING.bcDropResistanceBuff,
					duration: ARBITRARY_TURN_DURATION,
					value: 2,
				}),
				baseBuffFactory({
					id: BUFF_ID_MAPPING.hcDropResistanceBase,
					duration: ARBITRARY_TURN_DURATION,
					value: 3,
				}),
				baseBuffFactory({
					id: BUFF_ID_MAPPING.hcDropResistanceBuff,
					duration: ARBITRARY_TURN_DURATION,
					value: 4,
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = `1,2,3,4,${ARBITRARY_TURN_DURATION},6,7,8`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: BUFF_ID_MAPPING.bcDropResistanceBase,
					duration: ARBITRARY_TURN_DURATION,
					value: 1,
				}),
				baseBuffFactory({
					id: BUFF_ID_MAPPING.bcDropResistanceBuff,
					duration: ARBITRARY_TURN_DURATION,
					value: 2,
				}),
				baseBuffFactory({
					id: BUFF_ID_MAPPING.hcDropResistanceBase,
					duration: ARBITRARY_TURN_DURATION,
					value: 3,
				}),
				baseBuffFactory({
					id: BUFF_ID_MAPPING.hcDropResistanceBuff,
					duration: ARBITRARY_TURN_DURATION,
					value: 4,
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
				[EFFECT_KEY_MAPPING.bcDropResistanceBase]: 6,
				[EFFECT_KEY_MAPPING.bcDropResistanceBuff]: 7,
				[EFFECT_KEY_MAPPING.turnDuration]: ARBITRARY_TURN_DURATION,
			});

			const expectedResult = [
				baseBuffFactory({
					id: BUFF_ID_MAPPING.bcDropResistanceBase,
					duration: ARBITRARY_TURN_DURATION,
					value: 6,
				}),
				baseBuffFactory({
					id: BUFF_ID_MAPPING.bcDropResistanceBuff,
					duration: ARBITRARY_TURN_DURATION,
					value: 7,
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('for missing or 0 values', () => {
			PARAMS_ORDER.forEach((key, index) => {
				it(`returns a single buff for ${BUFF_ID_MAPPING[key]} if it's the only drop resistance parameter that is non-zero`, () => {
					const params = Array.from({ length: PARAMS_ORDER.length }).fill(0).map((_, i) => i !== index ? '0' : '123').concat([ARBITRARY_TURN_DURATION]).join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: BUFF_ID_MAPPING[key],
						duration: ARBITRARY_TURN_DURATION,
						value: 123,
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				if (key in EFFECT_KEY_MAPPING) {
					it(`returns a single buff for ${BUFF_ID_MAPPING[key]} if it's the only drop resistance parameter that is non-zero and the params property does not exist`, () => {
						const effect = createArbitraryBaseEffect({
							[EFFECT_KEY_MAPPING[key]]: 456,
							[EFFECT_KEY_MAPPING.turnDuration]: ARBITRARY_TURN_DURATION,
						});
						const expectedResult = [baseBuffFactory({
							id: BUFF_ID_MAPPING[key],
							duration: ARBITRARY_TURN_DURATION,
							value: 456,
						})];

						const result = mappingFunction(effect, createArbitraryContext());
						expect(result).toEqual(expectedResult);
					});
				}
			});

			describe('when drop resistance parameters are 0', () => {
				testTurnDurationScenarios({
					getMappingFunction: () => mappingFunction,
					getBaseBuffFactory: () => baseBuffFactory,
					createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,${duration}`,
					buffIdsInTurnDurationBuff: PARAMS_ORDER.map((k) => BUFF_ID_MAPPING[k]),
				});
			});
		});
	});

	describe('proc 58', () => {
		const expectedBuffId = 'proc:58:spark vulnerability';
		const expectedOriginalId = '58';

		const DAMAGE_BUFF_KEY = 'sparkDamage%';
		const EFFECT_KEY_MAPPING = {
			'sparkDamage%': 'spark dmg% received',
			chance: 'spark dmg received apply%',
			turnDuration: 'spark dmg received debuff turns (94)',
		};

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffId]);

		it('uses the params property when it exists', () => {
			const params = `1,2,${ARBITRARY_TURN_DURATION}`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				duration: ARBITRARY_TURN_DURATION,
				value: { [DAMAGE_BUFF_KEY]: 1, chance: 2 },
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});


		it('returns a buff entry for extra parameters', () => {
			const params = `1,2,${ARBITRARY_TURN_DURATION},4,5,6`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: expectedBuffId,
					duration: ARBITRARY_TURN_DURATION,
					value: { [DAMAGE_BUFF_KEY]: 1, chance: 2 },
				}),
				baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
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

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[EFFECT_KEY_MAPPING.chance]: 4,
				[EFFECT_KEY_MAPPING['sparkDamage%']]: 5,
				[EFFECT_KEY_MAPPING.turnDuration]: ARBITRARY_TURN_DURATION,
			});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				duration: ARBITRARY_TURN_DURATION,
				value: { chance: 4, [DAMAGE_BUFF_KEY]: 5 },
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when values are 0 or missing', () => {
			it('defaults to 0 for missing damage parameter', () => {
				const params = `,1,${ARBITRARY_TURN_DURATION}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: ARBITRARY_TURN_DURATION,
					value: { chance: 1, [DAMAGE_BUFF_KEY]: 0 },
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('defaults to 0 for missing damage parameter when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[EFFECT_KEY_MAPPING.chance]: 4,
					[EFFECT_KEY_MAPPING.turnDuration]: ARBITRARY_TURN_DURATION,
				});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: ARBITRARY_TURN_DURATION,
					value: { chance: 4, [DAMAGE_BUFF_KEY]: 0 },
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff if chance is 0 and turn duration is 0', () => {
				const params = '1,0,0';
				const effect = createArbitraryBaseEffect({ params });

				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});

			it('returns a no params buff if chance is 0 and turn duration is 0 and params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[EFFECT_KEY_MAPPING.chance]: 0,
					[EFFECT_KEY_MAPPING['sparkDamage%']]: 5,
					[EFFECT_KEY_MAPPING.turnDuration]: 0,
				});
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});

			testTurnDurationScenarios({
				getMappingFunction: () => mappingFunction,
				getBaseBuffFactory: () => baseBuffFactory,
				createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,${duration}`,
				buffIdsInTurnDurationBuff: [expectedBuffId],
			});
		});
	});

	describe('proc 59', () => {
		const BURST_TYPES = ['bb', 'sbb', 'ubb'];
		const expectedOriginalId = '59';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds(BURST_TYPES.map((type) => `proc:59:attack reduction-${type}`));

		it('uses the params property when it exists', () => {
			const params = `1,2,3,${ARBITRARY_TURN_DURATION}`;
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = BURST_TYPES.map((type, index) => {
				return baseBuffFactory({
					id: `proc:59:attack reduction-${type}`,
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
					id: `proc:59:attack reduction-${type}`,
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

		it('falls back to unknown proc params property when params property does not exist', () => {
			const params = `5,6,7,${ARBITRARY_TURN_DURATION}`;
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ 'unknown proc param': params });
			const expectedResult = BURST_TYPES.map((type, index) => {
				return baseBuffFactory({
					id: `proc:59:attack reduction-${type}`,
					duration: ARBITRARY_TURN_DURATION,
					value: +splitParams[index],
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
					id: `proc:59:attack reduction-${burstCase}`,
					duration: ARBITRARY_TURN_DURATION,
					value: 123,
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
				buffIdsInTurnDurationBuff: BURST_TYPES.map((type) => `proc:59:attack reduction-${type}`),
			});
		});
	});

	describe('proc 61', () => {
		const ADDED_ATK_BUFF_KEY = 'maxAddedAtk%';
		const PARAMS_ORDER = ['baseAtk%', ADDED_ATK_BUFF_KEY, 'flatAtk', 'crit%', 'bc%', 'hc%', 'dmg%'];
		const expectedBuffIdForAttack = 'proc:61:party bb gauge-scaled attack';
		const expectedBuffIdForBcDrain = 'proc:61:party bc drain';
		const expectedOriginalId = '61';

		const createExpectedBcDrainBuff = () => baseBuffFactory({
			id: expectedBuffIdForBcDrain,
			value: true,
			targetArea: TargetArea.Aoe,
			targetType: TargetType.Party,
		});

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffIdForAttack, expectedBuffIdForBcDrain]);

		it('uses the params property when it exists', () => {
			const params = '1,2,3,4,5,6,7';
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
				createExpectedBcDrainBuff(),
			];

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = '1,2,3,4,5,6,7,8,9,10';
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
				createExpectedBcDrainBuff(),
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

		it('falls back to effect properties when params property does not exist', () => {
			const mockValues = [7, 8, 9, 10, 11, 12, 13];
			const valuesInEffect = PARAMS_ORDER.reduce((acc, stat, index) => {
				let key;
				if (stat === 'flatAtk') {
					key = 'bb flat atk';
				} else if (stat === 'baseAtk%') {
					key = 'bb base atk%';
				} else if (stat === ADDED_ATK_BUFF_KEY) {
					key = 'bb max atk% based on ally bb gauge and clear bb gauges';
				} else {
					key = `bb ${stat}`;
				}
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
				acc[param] = mockValues[index];
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
				createExpectedBcDrainBuff(),
			];


			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		testMissingDamageFramesScenarios({
			getMappingFunction: () => mappingFunction,
			getBaseBuffFactory: () => baseBuffFactory,
			expectedBuffId: expectedBuffIdForAttack,
			getAdditionalBuffs: () => [createExpectedBcDrainBuff()],
		});

		PARAMS_ORDER.forEach((paramCase) => {
			it(`returns associated values for ${paramCase} if it is non-zero and other stats are zero`, () => {
				const params = PARAMS_ORDER.map((param) => param === paramCase ? '123' : '0').join(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForAttack,
						value: {
							[paramCase]: 123,
							hits: 0,
							distribution: 0,
						},
					}),
					createExpectedBcDrainBuff(),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it(`returns associated values for ${paramCase} if it is non-zero and other stats are zero and params property does not exist`, () => {
				const valuesInEffect = PARAMS_ORDER.reduce((acc, stat) => {
					let key;
					if (stat === 'flatAtk') {
						key = 'bb flat atk';
					} else if (stat === 'baseAtk%') {
						key = 'bb base atk%';
					} else if (stat === ADDED_ATK_BUFF_KEY) {
						key = 'bb max atk% based on ally bb gauge and clear bb gauges';
					} else {
						key = `bb ${stat}`;
					}
					acc[key] = stat === paramCase ? 789 : 0;
					return acc;
				}, {});
				const effect = createArbitraryBaseEffect(valuesInEffect);
				const expectedResult = [
					baseBuffFactory({
						id: expectedBuffIdForAttack,
						value: {
							[paramCase]: 789,
							hits: 0,
							distribution: 0,
						},
					}),
					createExpectedBcDrainBuff(),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});
		});
	});

	describe('proc 62', () => {
		const expectedOriginalId = '62';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds(Object.values(ELEMENT_MAPPING).concat(['unknown']).map((element) => `proc:62:barrier-${element}`));

		it('uses the params property when it exists', () => {
			const params = '0,1,2,3';
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [baseBuffFactory({
				id: 'proc:62:barrier-all',
				value: {
					hp: 1,
					defense: 2,
					'damageAbsorption%': 3,
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
					id: 'proc:62:barrier-fire',
					value: {
						hp: 2,
						defense: 3,
						'damageAbsorption%': 4,
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

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				'elemental barrier element': 'water',
				'elemental barrier hp': 6,
				'elemental barrier def': 7,
				'elemental barrier absorb dmg%': 8,
			});
			const expectedResult = [baseBuffFactory({
				id: 'proc:62:barrier-water',
				value: {
					hp: 6,
					defense: 7,
					'damageAbsorption%': 8,
				},
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when parsing element parameter', () => {
			Object.entries(ELEMENT_MAPPING).forEach(([elementKey, elementValue]) => {
				it(`parses value for ${elementValue}`, () => {
					const params = `${elementKey},1,2,3`;
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: `proc:62:barrier-${elementValue}`,
						value: {
							hp: 1,
							defense: 2,
							'damageAbsorption%': 3,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`parses value for ${elementValue} when params property does not exist`, () => {
					const effect = createArbitraryBaseEffect({
						'elemental barrier element': elementValue,
						'elemental barrier hp': 4,
						'elemental barrier def': 5,
						'elemental barrier absorb dmg%': 6,
					});
					const expectedResult = [baseBuffFactory({
						id: `proc:62:barrier-${elementValue}`,
						value: {
							hp: 4,
							defense: 5,
							'damageAbsorption%': 6,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			});

			it('parses unknown elements to "unknown"', () => {
				const params = '1234,1,2,3';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: 'proc:62:barrier-unknown',
					value: {
						hp: 1,
						defense: 2,
						'damageAbsorption%': 3,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('parses unknown elements to "unknown" when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					'elemental barrier element': 'arbitrary element',
					'elemental barrier hp': 4,
					'elemental barrier def': 5,
					'elemental barrier absorb dmg%': 6,
				});
				const expectedResult = [baseBuffFactory({
					id: 'proc:62:barrier-unknown',
					value: {
						hp: 4,
						defense: 5,
						'damageAbsorption%': 6,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('parses missing element property to "unknown" when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					'elemental barrier hp': 7,
					'elemental barrier def': 8,
					'elemental barrier absorb dmg%': 9,
				});
				const expectedResult = [baseBuffFactory({
					id: 'proc:62:barrier-unknown',
					value: {
						hp: 7,
						defense: 8,
						'damageAbsorption%': 9,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});
		});

		describe('when non-elemental parameters are missing or 0', () => {
			const NON_ELEMENTAL_EFFECT_KEY_TO_BUFF_KEY_MAPPING = {
				'elemental barrier hp': 'hp',
				'elemental barrier def': 'defense',
				'elemental barrier absorb dmg%': 'damageAbsorption%',
			};
			Object.keys(NON_ELEMENTAL_EFFECT_KEY_TO_BUFF_KEY_MAPPING).forEach(([buffKey]) => {
				it(`defaults to 0 for non-number ${buffKey} parameter`, () => {
					const params = [
						'0',
						buffKey !== 'hp' ? '123' : 'not a number',
						buffKey !== 'defense' ? '123' : 'not a number',
						buffKey !== 'damageAbsorption%' ? '123' : 'not a number',
					].join(',');
					const effect = createArbitraryBaseEffect({ params });
					const expectedResult = [baseBuffFactory({
						id: 'proc:62:barrier-all',
						value: {
							hp: buffKey !== 'hp' ? 123 : 0,
							defense: buffKey !== 'defense' ? 123 : 0,
							'damageAbsorption%': buffKey !== 'damageAbsorption%' ? 123 : 0,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`defaults to 0 for non-number ${buffKey} parameter when params property does not exist`, () => {
					const valuesInEffect = Object.entries(NON_ELEMENTAL_EFFECT_KEY_TO_BUFF_KEY_MAPPING).reduce((acc, [localEffectKey, localBuffKey]) => {
						acc[localEffectKey] = localBuffKey !== buffKey ? 456 : 'not a number';
						return acc;
					}, {});
					const effect = createArbitraryBaseEffect({
						'elemental barrier element': 'all',
						...valuesInEffect,
					});
					const expectedResult = [baseBuffFactory({
						id: 'proc:62:barrier-all',
						value: {
							hp: buffKey !== 'hp' ? 456 : 0,
							defense: buffKey !== 'defense' ? 456 : 0,
							'damageAbsorption%': buffKey !== 'damageAbsorption%' ? 456 : 0,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it(`defaults to 0 for missing ${buffKey} parameter when params property does not exist`, () => {
					const valuesInEffect = Object.entries(NON_ELEMENTAL_EFFECT_KEY_TO_BUFF_KEY_MAPPING).reduce((acc, [localEffectKey, localBuffKey]) => {
						if (localBuffKey !== buffKey) {
							acc[localEffectKey] = 789;
						}
						return acc;
					}, {});
					const effect = createArbitraryBaseEffect({
						'elemental barrier element': 'all',
						...valuesInEffect,
					});
					const expectedResult = [baseBuffFactory({
						id: 'proc:62:barrier-all',
						value: {
							hp: buffKey !== 'hp' ? 789 : 0,
							defense: buffKey !== 'defense' ? 789 : 0,
							'damageAbsorption%': buffKey !== 'damageAbsorption%' ? 789 : 0,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});

				it('returns a no params buff if all non-elemental parameters are 0', () => {
					const effect = createArbitraryBaseEffect({ params: '1,0,0,0' });
					expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
				});

				it('returns a no params buff no parameters are given and params property does not exist', () => {
					expectNoParamsBuffWithEffectAndContext({ effect: {}, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
				});
			});
		});
	});

	describe('proc 64', () => {
		const PARAMS_ORDER = ['atk%', 'addedAtkPerUse%', 'maxIncreases', 'flatAtk', 'crit%', 'bc%', 'hc%', 'dmg%'];
		const expectedBuffId = 'proc:64:consecutive usage attack';
		const expectedOriginalId = '64';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffId]);

		it('uses the params property when it exists', () => {
			const params = '1,2,3,4,5,6,7,8';
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
			const params = '1,2,3,4,5,6,7,8,9,10,11';
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
				if (stat === 'flatAtk') {
					key = 'bb flat atk';
				} else if (stat === 'addedAtkPerUse%') {
					key = 'bb atk% inc per use';
				} else if (stat === 'maxIncreases') {
					key = 'bb atk% max number of inc';
				} else {
					key = `bb ${stat}`;
				}
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

	describe('proc 65', () => {
		const expectedOriginalId = '65';
		testProcWithSingleNumericalParameterAndTurnDuration({
			getMappingFunction: () => getProcEffectToBuffMapping().get(expectedOriginalId),
			getBaseBuffFactory: () => createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId),
			expectedOriginalId,
			expectedBuffId: 'proc:65:ailment attack boost',
			effectValueKey: 'atk% buff when enemy has ailment',
			effectTurnDurationKey: 'atk% buff turns (110)',
		});
	});

	describe('proc 66', () => {
		const expectedBuffId = 'proc:66:chance revive';
		const expectedOriginalId = '66';

		const HP_BUFF_KEY = 'reviveToHp%';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffId]);

		it('uses the params property when it exists', () => {
			const params = '1,2';
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: {
					[HP_BUFF_KEY]: 1,
					chance: 2,
				},
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = '1,2,3,4,5';
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: expectedBuffId,
					value: {
						[HP_BUFF_KEY]: 1,
						chance: 2,
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

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				'revive unit hp%': 3,
				'revive unit chance%': 4,
			});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: {
					[HP_BUFF_KEY]: 3,
					chance: 4,
				},
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('converts effect properties to numbers when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				'revive unit hp%': '5',
				'revive unit chance%': '6',
			});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: {
					[HP_BUFF_KEY]: 5,
					chance: 6,
				},
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when values are missing or 0', () => {
			it('defaults to 0 for non-number hp parameter', () => {
				const params = ',2';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						[HP_BUFF_KEY]: 0,
						chance: 2,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('defaults to 0 for non-number hp parameter when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					'revive unit hp%': 'not a number',
					'revive unit chance%': 4,
				});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						[HP_BUFF_KEY]: 0,
						chance: 4,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('defaults to 0 for missing hp parameter when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					'revive unit chance%': 6,
				});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						[HP_BUFF_KEY]: 0,
						chance: 6,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff when no parameters are given', () => {
				const effect = createArbitraryBaseEffect();
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});

			it('returns a no params buff when chance is 0', () => {
				const params = '123,0';
				const effect = createArbitraryBaseEffect({ params });
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});

			it('returns a no params buff when chance is 0 and params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					'revive unit hp%': 456,
					'revive unit chance%': 0,
				});
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});
		});
	});

	describe('proc 67', () => {
		const expectedOriginalId = '67';
		testProcWithNumericalValueRangeAndChanceAndTurnDuration({
			getMappingFunction: () => getProcEffectToBuffMapping().get(expectedOriginalId),
			getBaseBuffFactory: () => createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId),
			expectedOriginalId,
			expectedBuffId: 'proc:67:bc fill on spark',
			effectKeyLow: 'bc fill on spark low',
			effectKeyHigh: 'bc fill on spark high',
			effectKeyChance: 'bc fill on spark%',
			effectTurnDurationKey: 'bc fill on spark buff turns (111)',
			buffKeyLow: 'fillLow',
			buffKeyHigh: 'fillHigh',
			getExpectedValueFromParam: (param) => +param / 100,
		});
	});

	describe('proc 68', () => {
		const expectedOriginalId = '68';
		testProcWithSingleNumericalParameterAndTurnDuration({
			getMappingFunction: () => getProcEffectToBuffMapping().get(expectedOriginalId),
			getBaseBuffFactory: () => createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId),
			expectedOriginalId,
			expectedBuffId: 'proc:68:guard mitigation',
			effectValueKey: 'guard increase mitigation%',
			effectTurnDurationKey: 'guard increase mitigation buff turns (113)',
		});
	});

	describe('proc 69', () => {
		const expectedFlatFillId = 'proc:69:bc fill on guard-flat';
		const expectedPercentFillId = 'proc:69:bc fill on guard-percent';
		const FLAT_FILL_KEY = 'bb bc fill on guard';
		const PERCENT_FILL_KEY = 'bb bc fill% on guard';
		const EFFECT_TURN_DURATION_KEY = 'bb bc fill on guard buff turns (114)';
		const expectedOriginalId = '69';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedFlatFillId, expectedPercentFillId]);

		it('uses the params property when it exists', () => {
			const params = `100,2,${ARBITRARY_TURN_DURATION}`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: expectedFlatFillId,
					duration: ARBITRARY_TURN_DURATION,
					value: 1,
					conditions: {
						onGuard: true,
					},
				}),
				baseBuffFactory({
					id: expectedPercentFillId,
					duration: ARBITRARY_TURN_DURATION,
					value: 2,
					conditions: {
						onGuard: true,
					},
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = `100,2,${ARBITRARY_TURN_DURATION},4,5,6`;
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = [
				baseBuffFactory({
					id: expectedFlatFillId,
					value: 1,
					duration: ARBITRARY_TURN_DURATION,
					conditions: {
						onGuard: true,
					},
				}),
				baseBuffFactory({
					id: expectedPercentFillId,
					value: 2,
					duration: ARBITRARY_TURN_DURATION,
					conditions: {
						onGuard: true,
					},
				}),
				baseBuffFactory({
					id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
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

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[FLAT_FILL_KEY]: 4,
				[PERCENT_FILL_KEY]: 5,
				[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
			});
			const expectedResult = [
				baseBuffFactory({
					id: expectedFlatFillId,
					duration: ARBITRARY_TURN_DURATION,
					value: 4,
					conditions: {
						onGuard: true,
					},
				}),
				baseBuffFactory({
					id: expectedPercentFillId,
					duration: ARBITRARY_TURN_DURATION,
					value: 5,
					conditions: {
						onGuard: true,
					},
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('converts effect properties to numbers when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				[FLAT_FILL_KEY]: '6',
				[PERCENT_FILL_KEY]: '7',
				[EFFECT_TURN_DURATION_KEY]: '8',
			});
			const expectedResult = [
				baseBuffFactory({
					id: expectedFlatFillId,
					duration: 8,
					value: 6,
					conditions: {
						onGuard: true,
					},
				}),
				baseBuffFactory({
					id: expectedPercentFillId,
					duration: 8,
					value: 7,
					conditions: {
						onGuard: true,
					},
				}),
			];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when values are missing', () => {
			it('returns only buff for percent fill if flat fill value is 0', () => {
				const params = `0,123,${ARBITRARY_TURN_DURATION}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedPercentFillId,
						duration: ARBITRARY_TURN_DURATION,
						value: 123,
						conditions: {
							onGuard: true,
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns only buff for flat fill if percent fill value is 0', () => {
				const params = `12300,0,${ARBITRARY_TURN_DURATION}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatFillId,
						duration: ARBITRARY_TURN_DURATION,
						value: 123,
						conditions: {
							onGuard: true,
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns only buff for percent fill if flat fill value is 0 and params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[FLAT_FILL_KEY]: 0,
					[PERCENT_FILL_KEY]: 123,
					[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedPercentFillId,
						duration: ARBITRARY_TURN_DURATION,
						value: 123,
						conditions: {
							onGuard: true,
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns only buff for flat fill if percent fill value is 0 and params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[FLAT_FILL_KEY]: 123,
					[PERCENT_FILL_KEY]: 0,
					[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatFillId,
						duration: ARBITRARY_TURN_DURATION,
						value: 123,
						conditions: {
							onGuard: true,
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns only buff for percent fill if flat fill value is missing and params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[PERCENT_FILL_KEY]: 123,
					[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedPercentFillId,
						duration: ARBITRARY_TURN_DURATION,
						value: 123,
						conditions: {
							onGuard: true,
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns only buff for flat fill if percent fill value is missing and params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[FLAT_FILL_KEY]: 123,
					[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
				});
				const expectedResult = [
					baseBuffFactory({
						id: expectedFlatFillId,
						duration: ARBITRARY_TURN_DURATION,
						value: 123,
						conditions: {
							onGuard: true,
						},
					}),
				];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff when no parameters are given', () => {
				const effect = createArbitraryBaseEffect();
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});
		});

		describe('when both flat fill and percent fill values are 0', () => {
			testTurnDurationScenarios({
				getMappingFunction: () => mappingFunction,
				getBaseBuffFactory: () => baseBuffFactory,
				createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,${duration}`,
				buffIdsInTurnDurationBuff: [expectedFlatFillId, expectedPercentFillId],
			});
		});
	});

	describe('proc 71', () => {
		const expectedOriginalId = '71';
		testProcWithSingleNumericalParameterAndTurnDuration({
			getMappingFunction: () => getProcEffectToBuffMapping().get(expectedOriginalId),
			getBaseBuffFactory: () => createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId),
			expectedOriginalId,
			expectedBuffId: 'proc:71:bc efficacy reduction',
			effectValueKey: 'bb fill inc%',
			effectTurnDurationKey: 'bb fill inc buff turns (112)',
		});
	});

	describe('proc 73', () => {
		const AILMENTS_ORDER = [Ailment.AttackReduction, Ailment.DefenseReduction, Ailment.RecoveryReduction];
		const EFFECT_TURN_DURATION_KEY = 'stat down immunity buff turns';
		const expectedOriginalId = '73';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds(AILMENTS_ORDER.map((ailment) => `proc:73:resist-${ailment}`));

		it('uses the params property when it exists', () => {
			const params = `1,2,3,${ARBITRARY_TURN_DURATION}`;
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
				return baseBuffFactory({
					id: `proc:73:resist-${ailment}`,
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
			const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
				return baseBuffFactory({
					id: `proc:73:resist-${ailment}`,
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
			const effect = createArbitraryBaseEffect({
				'atk down resist% (120)': 5, // the numbers here are from actual data; separate unit tests handle more arbitrary cases
				'def down resist% (121)': 6,
				'rec down resist% (122)': 7,
				[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
			});
			const expectedParamValues = [5, 6, 7];
			const expectedResult = AILMENTS_ORDER.map((ailment, index) => {
				return baseBuffFactory({
					id: `proc:73:resist-${ailment}`,
					duration: ARBITRARY_TURN_DURATION,
					value: expectedParamValues[index],
				});
			});

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		AILMENTS_ORDER.forEach((ailmentCase) => {
			it(`returns only value for ${ailmentCase} if it is non-zero and other stats are zero`, () => {
				const params = AILMENTS_ORDER.map((ailment) => ailment === ailmentCase ? '123' : '0').concat([ARBITRARY_TURN_DURATION]).join(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: `proc:73:resist-${ailmentCase}`,
					duration: ARBITRARY_TURN_DURATION,
					value: 123,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it(`returns only value for ${ailmentCase} if it is non-zero and other stats are zero and params property does not exist`, () => {
				const ailmentKey = ailmentCase !== Ailment.Weak ? ailmentCase : 'weaken';
				const effect = createArbitraryBaseEffect({
					[`${ailmentKey} resist% (${Math.floor(Math.random() * 100)})`]: 123,
					[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
				});
				const expectedResult = [baseBuffFactory({
					id: `proc:73:resist-${ailmentCase}`,
					duration: ARBITRARY_TURN_DURATION,
					value: 123,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});
		});

		describe('when all resistances are 0', () => {
			testTurnDurationScenarios({
				getMappingFunction: () => mappingFunction,
				getBaseBuffFactory: () => baseBuffFactory,
				createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,${duration}`,
				buffIdsInTurnDurationBuff: AILMENTS_ORDER.map((ailment) => `proc:73:resist-${ailment}`),
			});
		});
	});

	describe('proc 75', () => {
		const PARAMS_ORDER = ['baseAtk%', 'addedAttackPerUnitWithMatchingElement%', 'flatAtk', 'crit%', 'bc%', 'hc%', 'dmg%'];
		const BUFF_KEY_TO_EFFECT_KEY_MAPPING = {
			elementToMatch: 'counted element for buff multiplier',
			'baseAtk%': 'atk% buff (1)',
			'addedAttackPerUnitWithMatchingElement%': 'def% buff (3)',
			flatAtk: 'rec% buff (5)',
			'crit%': 'crit% buff (7)',
			'bc%': 'buff turns',
		};
		const expectedBuffId = 'proc:75:element squad-scaled attack';
		const expectedOriginalId = '75';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffId]);

		it('uses the params property when it exists', () => {
			const params = '1,2,3,4,5,6,7,8';
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			});
			const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
				acc[param] = +splitParams[index + 1];
				return acc;
			}, {});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: {
					...expectedValuesForParams,
					elementToMatch: 'fire',
					hits: ARBITRARY_HIT_COUNT,
					distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			})];

			const result = mappingFunction(effect, context);
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = '1,2,3,4,5,6,7,8,9,10,11';
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			});
			const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
				acc[param] = +splitParams[index + 1];
				return acc;
			}, {});
			const expectedResult = [
				baseBuffFactory({
					id: expectedBuffId,
					value: {
						...expectedValuesForParams,
						elementToMatch: 'fire',
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
			const mockValues = [9, 10, 11, 12, 13, 14];
			const valuesInEffect = PARAMS_ORDER.reduce((acc, param, index) => {
				if (param in BUFF_KEY_TO_EFFECT_KEY_MAPPING) {
					const key = BUFF_KEY_TO_EFFECT_KEY_MAPPING[param];
					acc[key] = mockValues[index];
				}
				return acc;
			}, {});
			valuesInEffect[BUFF_KEY_TO_EFFECT_KEY_MAPPING.elementToMatch] = 'arbitrary element'; // taken at face vlaue
			const effect = createArbitraryBaseEffect(valuesInEffect);
			const context = createArbitraryContext({
				damageFrames: {
					hits: ARBITRARY_HIT_COUNT,
					[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
				},
			});
			const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
				if (param in BUFF_KEY_TO_EFFECT_KEY_MAPPING) {
					acc[param] = +mockValues[index];
				}
				return acc;
			}, {});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: {
					...expectedValuesForParams,
					elementToMatch: 'arbitrary element',
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
				buff.value.elementToMatch = 'unknown';
			},
		});

		PARAMS_ORDER.forEach((paramCase) => {
			it(`returns only value for ${paramCase} if it is non-zero and other stats are zero`, () => {
				const params = ['1'].concat((PARAMS_ORDER.map((param) => param === paramCase ? '789' : '0'))).join(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						[paramCase]: 789,
						elementToMatch: 'fire',
						hits: 0,
						distribution: 0,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			if (paramCase in BUFF_KEY_TO_EFFECT_KEY_MAPPING) {
				it(`returns only value for ${paramCase} if it is non-zero and other stats are zero and params property does not exist`, () => {
					const effect = createArbitraryBaseEffect({
						[BUFF_KEY_TO_EFFECT_KEY_MAPPING[paramCase]]: 456,
						[BUFF_KEY_TO_EFFECT_KEY_MAPPING.elementToMatch]: 'arbitrary element',
					});
					const expectedResult = [baseBuffFactory({
						id: expectedBuffId,
						value: {
							[paramCase]: 456,
							elementToMatch: 'arbitrary element',
							hits: 0,
							distribution: 0,
						},
					})];

					const result = mappingFunction(effect, createArbitraryContext());
					expect(result).toEqual(expectedResult);
				});
			}
		});

		Object.entries(ELEMENT_MAPPING).forEach(([elementKey, elementValue]) => {
			it(`parses element parameter [${elementKey}] as [${elementValue}]`, () => {
				const params = [elementKey].concat((PARAMS_ORDER.map((_, index) => index + 1))).join(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
					acc[param] = index + 1;
					return acc;
				}, {});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						...expectedValuesForParams,
						elementToMatch: elementValue,
						hits: 0,
						distribution: 0,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});
		});

		it('parses element parameters with no mapping as "unknown"', () => {
			const params = [123].concat((PARAMS_ORDER.map((_, index) => index + 1))).join(',');
			const effect = createArbitraryBaseEffect({ params });
			const expectedValuesForParams = PARAMS_ORDER.reduce((acc, param, index) => {
				acc[param] = index + 1;
				return acc;
			}, {});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: {
					...expectedValuesForParams,
					elementToMatch: 'unknown',
					hits: 0,
					distribution: 0,
				},
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('parses lack of element property as "unknown" when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({ [BUFF_KEY_TO_EFFECT_KEY_MAPPING.flatAtk]: 123 });
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: {
					flatAtk: 123,
					elementToMatch: 'unknown',
					hits: 0,
					distribution: 0,
				},
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});
	});
});
