const { ARBITRARY_TURN_DURATION } = require('../../_test-helpers/constants');
const { testTurnDurationScenarios, expectNoParamsBuffWithEffectAndContext, createArbitraryContext, createArbitraryBaseEffect, createFactoryForBaseBuffFromArbitraryEffect, testFunctionExistence, testValidBuffIds } = require('../../_test-helpers/proc-effect-mapping.utils');
const { BuffId } = require('./buff-types');
const { getProcEffectToBuffMapping } = require('./proc-effect-mapping');

describe('getProcEffectBuffMapping method for default mapping', () => {
	/**
	 * @type {import('./proc-effect-mapping').ProcEffectToBuffFunction}
	 */
	let mappingFunction;
	/**
	 * @type {(params?: import('./buff-types').IBuff, propsToDelete?: string[]) => import('./buff-types').IBuff}
	 */
	let baseBuffFactory;

	describe('proc 76', () => {
		const expectedBuffId = 'proc:76:extra action';
		const expectedOriginalId = '76';

		const EFFECT_KEY_MAPPING = {
			maxExtraActions: 'max number of extra actions',
			chance: 'chance% for extra action',
			turnDuration: 'extra action buff turns (123)',
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
				value: { maxExtraActions: 1, chance: 2 },
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
					value: { maxExtraActions: 1, chance: 2 },
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
				[EFFECT_KEY_MAPPING.maxExtraActions]: 4,
				[EFFECT_KEY_MAPPING.chance]: 5,
				[EFFECT_KEY_MAPPING.turnDuration]: ARBITRARY_TURN_DURATION,
			});
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				duration: ARBITRARY_TURN_DURATION,
				value: { maxExtraActions: 4, chance: 5 },
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when values are 0 or missing', () => {
			it('defaults to 0 for missing count parameter', () => {
				const params = `,1,${ARBITRARY_TURN_DURATION}`;
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: ARBITRARY_TURN_DURATION,
					value: { chance: 1, maxExtraActions: 0 },
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('defaults to 0 for missing count parameter when params property does not exist', () => {
				const effect = createArbitraryBaseEffect({
					[EFFECT_KEY_MAPPING.chance]: 4,
					[EFFECT_KEY_MAPPING.turnDuration]: ARBITRARY_TURN_DURATION,
				});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					duration: ARBITRARY_TURN_DURATION,
					value: { chance: 4, maxExtraActions: 0 },
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
					[EFFECT_KEY_MAPPING.maxExtraActions]: 5,
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

	describe('proc 78', () => {
		const STAT_PARAMS_ORDER = ['atk', 'def', 'rec', 'crit'];
		const EFFECT_TURN_DURATION_KEY = 'self stat buff turns';
		const expectedOriginalId = '78';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds(STAT_PARAMS_ORDER.map((stat) => `proc:78:self stat boost-${stat}`));

		it('uses the params property when it exists', () => {
			const params = `1,2,3,4,${ARBITRARY_TURN_DURATION}`;
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
				return baseBuffFactory({
					id: `proc:78:self stat boost-${stat}`,
					duration: ARBITRARY_TURN_DURATION,
					value: +splitParams[index],
				});
			});

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('returns a buff entry for extra parameters', () => {
			const params = `1,2,3,4,${ARBITRARY_TURN_DURATION},6,7,8`;
			const splitParams = params.split(',');
			const effect = createArbitraryBaseEffect({ params });
			const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
				return baseBuffFactory({
					id: `proc:78:self stat boost-${stat}`,
					duration: ARBITRARY_TURN_DURATION,
					value: +splitParams[index],
				});
			}).concat([baseBuffFactory({
				id: BuffId.UNKNOWN_PROC_BUFF_PARAMS,
				value: {
					param_5: '6',
					param_6: '7',
					param_7: '8',
				},
			})]);

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		it('falls back to effect properties when params property does not exist', () => {
			const effect = createArbitraryBaseEffect({
				'self atk% buff': 6,
				'self def% buff': 7,
				'self rec% buff': 8,
				'self crit% buff': 9,
				[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
			});
			const expectedParamValues = [6, 7, 8, 9];
			const expectedResult = STAT_PARAMS_ORDER.map((stat, index) => {
				return baseBuffFactory({
					id: `proc:78:self stat boost-${stat}`,
					duration: ARBITRARY_TURN_DURATION,
					value: expectedParamValues[index],
				});
			});

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		STAT_PARAMS_ORDER.forEach((statCase) => {
			it(`returns only value for ${statCase} if it is non-zero and other stats are zero and only one element is specified`, () => {
				const params = [...STAT_PARAMS_ORDER.map((stat) => stat === statCase ? '123' : '0'), ARBITRARY_TURN_DURATION].join(',');
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: `proc:78:self stat boost-${statCase}`,
					duration: ARBITRARY_TURN_DURATION,
					value: 123,
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it(`parses ${statCase} buff in effect when params property does not exist`, () => {
				const effect = createArbitraryBaseEffect({
					[`self ${statCase}% buff`]: 456,
					[EFFECT_TURN_DURATION_KEY]: ARBITRARY_TURN_DURATION,
				});
				const expectedResult = [baseBuffFactory({
					id: `proc:78:self stat boost-${statCase}`,
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
				createParamsWithZeroValueAndTurnDuration: (duration) => `0,0,0,0,${duration}`,
				buffIdsInTurnDurationBuff: STAT_PARAMS_ORDER.map((stat) => `proc:78:self stat boost-${stat}`),
			});
		});
	});

	describe('proc 79', () => {
		const expectedBuffId = 'proc:79:player exp boost';
		const expectedOriginalId = '79';
		const EXP_BOOST_BUFF_KEY = 'expBoost%';

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
					[EXP_BOOST_BUFF_KEY]: 1,
					durationInMinutes: 2,
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
						[EXP_BOOST_BUFF_KEY]: 1,
						durationInMinutes: 2,
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

		it('falls back to unknown proc params property when params property does not exist', () => {
			const params = '3,4';
			const effect = createArbitraryBaseEffect({ 'unknown proc param': params });
			const expectedResult = [baseBuffFactory({
				id: expectedBuffId,
				value: {
					[EXP_BOOST_BUFF_KEY]: 3,
					durationInMinutes: 4,
				},
			})];

			const result = mappingFunction(effect, createArbitraryContext());
			expect(result).toEqual(expectedResult);
		});

		describe('when values are missing', () => {
			it('defaults to 0 for missing duration value', () => {
				const params = '123';
				const effect = createArbitraryBaseEffect({ params });
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						[EXP_BOOST_BUFF_KEY]: 123,
						durationInMinutes: 0,
					},
				})];

				const result = mappingFunction(effect, createArbitraryContext());
				expect(result).toEqual(expectedResult);
			});

			it('returns a no params buff when no parameters are given', () => {
				const effect = createArbitraryBaseEffect();
				expectNoParamsBuffWithEffectAndContext({ effect, context: createArbitraryContext(), mappingFunction, baseBuffFactory });
			});
		});
	});
});
