const { BuffId } = require('../buffs/parsers/buff-types');
const { getProcEffectToBuffMapping } = require('../buffs/parsers/proc-effect-mapping');
const { ARBITRARY_EFFECT_DELAY, EFFECT_DELAY_KEY, ARBITRARY_HIT_COUNT, HIT_DMG_DISTRIBUTION_TOTAL_KEY, EFFECT_DELAY_BUFF_PROP, ARBITRARY_DAMAGE_DISTRIBUTION } = require('./constants');

const BUFF_TARGET_PROPS = ['targetType', 'targetArea'];

/**
 * @param {import('../buffs/parsers/buff-types').IEffectToBuffConversionContext} params
 * @returns {import('../buffs/parsers/buff-types').IEffectToBuffConversionContext}
 */
const createArbitraryContext = (params = {}) => ({
	source: 'arbitrary source',
	sourceId: 'arbitrary source id',
	...params,
});
const createExpectedSourcesForArbitraryContext = () => ['arbitrary source-arbitrary source id'];
const createArbitraryTargetDataForEffect = () => ({
	'target type': 'arbitrary target type',
	'target area': 'arbitrary target area',
});
const createExpectedTargetDataForBuffFromArbitraryTargetDataInEffect = () => ({
	targetType: 'arbitrary target type',
	targetArea: 'arbitrary target area',
});

/**
 * @param {import('../datamine-types').ProcEffect?} params
 * @returns {import('../datamine-types').ProcEffect}
 */
const createArbitraryBaseEffect = (params = {}) => ({
	[EFFECT_DELAY_KEY]: ARBITRARY_EFFECT_DELAY,
	...createArbitraryTargetDataForEffect(),
	...params,
});

/**
 * @param {string} originalId
 * @returns {(params?: import('../buffs/parsers/buff-types').IBuff, propsToDelete?: string[]) => import('.../buffs/parsers/buff-types').IBuff}
 */
const createFactoryForBaseBuffFromArbitraryEffect = (originalId) => {
	return (params = {}, propsToDelete = []) => {
		const result = {
			originalId,
			sources: createExpectedSourcesForArbitraryContext(),
			effectDelay: ARBITRARY_EFFECT_DELAY,
			...createExpectedTargetDataForBuffFromArbitraryTargetDataInEffect(),
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
		const map = getProcEffectToBuffMapping();
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

const expectNoParamsBuffWithEffectAndContext = ({ effect, context, injectionContext, expectedSources, baseBuffFactory, mappingFunction }) => {
	const expectedResult = [baseBuffFactory({
		id: BuffId.NO_PARAMS_SPECIFIED,
	}, [EFFECT_DELAY_BUFF_PROP, ...BUFF_TARGET_PROPS])];
	if (expectedSources) {
		expectedResult[0].sources = expectedSources;
	}

	const result = mappingFunction(effect, context, injectionContext);
	expect(result).toEqual(expectedResult);
};

/**
 * @description Common set of tests for effects regarding when different parts of the context for attacks are missing.
 * @param {object} context
 * @param {() => import('../buffs/parsers/proc-effect-mapping').ProcEffectToBuffFunction} context.getMappingFunction
 * @param {() => (params?: import('../buffs/parsers/buff-types').IBuff, propsToDelete?: string[]) => import('../buffs/parsers/buff-types').IBuff} context.getBaseBuffFactory
 * @param {string} context.expectedBuffId
 * @param {string} context.expectedTargetArea
 * @param {() => import('../buffs/parsers/buff-types').IBuff[]} context.getAdditionalBuffs
 * @param {boolean?} context.testHits
 * @param {(buff: import('../buffs/parsers/buff-types').IBuff) => void} context.updateExpectedBuffForOnlyHitsOrDistributionCase
 */
const testMissingDamageFramesScenarios = ({
	getMappingFunction,
	getBaseBuffFactory,
	expectedBuffId,
	expectedTargetArea,
	updateExpectedBuffForOnlyHitsOrDistributionCase,
	getAdditionalBuffs,
	testHits = true,
}) => {
	/**
	 * @type {import('./proc-effect-mapping').ProcEffectToBuffFunction}
	 */
	let mappingFunction;
	/**
	 * @type {(params?: import('./buff-types').IBuff, propsToDelete?: string[]) => import('./buff-types').IBuff}
	 */
	let baseBuffFactory;

	describe('for missing parts of context.damageFrames', () => {
		/**
		 * @param {import('../buffs/parsers/buff-types').IBuff} buff
		 */
		const applyTargetAreaAsNeeded = (buff) => {
			if (expectedTargetArea) {
				buff.targetArea = expectedTargetArea;
			}
		};

		beforeEach(() => {
			mappingFunction = getMappingFunction();
			baseBuffFactory = getBaseBuffFactory();
		});

		it('returns a no params buff if context.damageFrames does not exist and no other parameters are specified', () => {
			expectNoParamsBuffWithEffectAndContext({ effect: createArbitraryBaseEffect(), context: createArbitraryContext(), mappingFunction, baseBuffFactory });
		});

		if (testHits) {
			it('defaults to 0 for hits if context.damageFrames.hits does not exist', () => {
				const context = createArbitraryContext({
					damageFrames: {
						[HIT_DMG_DISTRIBUTION_TOTAL_KEY]: ARBITRARY_DAMAGE_DISTRIBUTION,
					},
				});
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						hits: 0,
						distribution: ARBITRARY_DAMAGE_DISTRIBUTION,
					},
				})];
				if (getAdditionalBuffs) {
					expectedResult.push(...getAdditionalBuffs());
				}
				applyTargetAreaAsNeeded(expectedResult[0]);
				if (updateExpectedBuffForOnlyHitsOrDistributionCase) {
					updateExpectedBuffForOnlyHitsOrDistributionCase(expectedResult[0]);
				}

				const result = mappingFunction(createArbitraryBaseEffect(), context);
				expect(result).toEqual(expectedResult);
			});
		}

		it('defaults to 0 for distribution if context.damageFrames["hit dmg% distribution (total)"] does not exist', () => {
			const damageFrames = {};
			let expectedFinalHits = 0;
			if (testHits) {
				damageFrames.hits = ARBITRARY_HIT_COUNT;
				expectedFinalHits = ARBITRARY_HIT_COUNT;
			}
			const context = createArbitraryContext({ damageFrames });
			if (testHits) {
				const expectedResult = [baseBuffFactory({
					id: expectedBuffId,
					value: {
						hits: expectedFinalHits,
						distribution: 0,
					},
				})];
				if (getAdditionalBuffs) {
					expectedResult.push(...getAdditionalBuffs());
				}
				applyTargetAreaAsNeeded(expectedResult[0]);
				if (updateExpectedBuffForOnlyHitsOrDistributionCase) {
					updateExpectedBuffForOnlyHitsOrDistributionCase(expectedResult[0]);
				}

				const result = mappingFunction(createArbitraryBaseEffect(), context);
				expect(result).toEqual(expectedResult);
			} else {
				// buff gets hit value from elseewhere, so specifying only hits is identical to specifying nothing for damage frames
				expectNoParamsBuffWithEffectAndContext({ effect: createArbitraryBaseEffect(), context, mappingFunction, baseBuffFactory });
			}
		});
	});
};

module.exports = {
	createArbitraryBaseEffect,
	createArbitraryContext,
	createFactoryForBaseBuffFromArbitraryEffect,
	expectNoParamsBuffWithEffectAndContext,
	testFunctionExistence,
	testMissingDamageFramesScenarios,
	testValidBuffIds,
};
