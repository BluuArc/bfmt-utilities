const { Ailment } = require('../../datamine-types');
const { ARBITRARY_TURN_DURATION, NON_ZERO_ELEMENT_MAPPING, EFFECT_DELAY_BUFF_PROP } = require('../../_test-helpers/constants');
const { createFactoryForBaseBuffFromArbitraryEffect, testFunctionExistence, testValidBuffIds, createArbitraryBaseEffect, createArbitraryContext, testTurnDurationScenarios, testProcWithSingleNumericalParameterAndTurnDuration } = require('../../_test-helpers/proc-effect-mapping.utils');
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
});
