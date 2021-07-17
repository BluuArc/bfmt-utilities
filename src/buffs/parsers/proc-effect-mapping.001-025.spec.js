const { getProcEffectToBuffMapping } = require('./proc-effect-mapping');
const { BuffId } = require('./buff-types');
// const { UnitElement, Ailment, TargetArea, TargetType } = require('../../datamine-types');
const { createFactoryForBaseBuffFromArbitraryEffect, testFunctionExistence, testValidBuffIds, createArbitraryBaseEffect, createArbitraryContext, testMissingDamageFramesScenarios } = require('../../_test-helpers/proc-effect-mapping.utils');
const { ARBITRARY_HIT_COUNT, ARBITRARY_DAMAGE_DISTRIBUTION, HIT_DMG_DISTRIBUTION_TOTAL_KEY } = require('../../_test-helpers/constants');

describe('getProcEffectBuffMapping method for default mapping', () => {
	/**
	 * @type {import('./proc-effect-mapping').ProcEffectToBuffFunction}
	 */
	let mappingFunction;
	/**
	 * @type {(params?: import('./buff-types').IBuff, propsToDelete?: string[]) => import('./buff-types').IBuff}
	 */
	let baseBuffFactory;

	describe('proc 1', () => {
		const PARAMS_ORDER = ['atk%', 'flatAtk', 'crit%', 'bc%', 'hc%', 'dmg%'];
		const expectedBuffId = 'proc:1:attack';
		const expectedOriginalId = '1';

		beforeEach(() => {
			mappingFunction = getProcEffectToBuffMapping().get(expectedOriginalId);
			baseBuffFactory = createFactoryForBaseBuffFromArbitraryEffect(expectedOriginalId);
		});

		testFunctionExistence(expectedOriginalId);
		testValidBuffIds([expectedBuffId]);

		it('uses the params property when it exists', () => {
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
						param_6: '7',
						param_7: '8',
						param_8: '9',
					},
				}),
			];

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
});
