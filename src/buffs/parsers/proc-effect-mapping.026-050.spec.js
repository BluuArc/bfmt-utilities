const { ARBITRARY_TURN_DURATION } = require('../../_test-helpers/constants');
const { createFactoryForBaseBuffFromArbitraryEffect, testFunctionExistence, testValidBuffIds, createArbitraryBaseEffect, createArbitraryContext, expectNoParamsBuffWithEffectAndContext, testTurnDurationScenarios } = require('../../_test-helpers/proc-effect-mapping.utils');
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
});
