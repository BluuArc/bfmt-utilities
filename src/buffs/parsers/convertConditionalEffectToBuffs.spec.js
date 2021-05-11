const { BuffId } = require('./buff-types');
const { getConditionalEffectToBuffMapping } = require('./conditional-effect-mapping');
const { KNOWN_CONDITIONAL_ID } = require('../constants');

const convertConditionalEffectToBuffs = require('./convertConditionalEffectToBuffs').default;

describe('convertConditionalEffectToBuffs method', () => {
	const arbitrarySource = 'arbitrary source';
	const arbitrarySourceId = 'arbitrary source id';

	/**
	 * @returns {import('./buff-types').IConditionalEffect}
	 */
	const generateArbitraryEffect = (id, params = {}) => ({
		id,
		...params,
	});

	/**
	 * @returns {import('./buff-types').IEffectToBuffConversionContext}
	 */
	const generateArbitraryContext = (params = {}) => ({
		source: arbitrarySource,
		sourceId: arbitrarySourceId,
		...params,
	});

	/**
		 * @param {import('./buff-types').IBuff[]} result
		 */
	const expectUnknownBuffResult = (result, id) => {
		expect(Array.isArray(result))
			.withContext('result is not an array')
			.toBeTrue();
		expect(result.length)
			.withContext('result does not have only one entry')
			.toBe(1);
		expect(result[0])
			.toEqual({
				id: BuffId.UNKNOWN_CONDITIONAL_EFFECT_ID,
				originalId: id,
				sources: [`${arbitrarySource}-${arbitrarySourceId}`],
			});
	};

	beforeEach(() => {
		// start with a fresh copy of the conditional mapping on every test
		getConditionalEffectToBuffMapping(true);
	});

	describe('for invalid inputs', () => {
		const expectedEffectErrorMessage = 'effect parameter should be an object';
		const expectedContextErrorMessage = 'context parameter should be an object';

		[
			{
				name: 'is null',
				value: null,
			},
			{
				name: 'is undefined',
				value: (void 0),
			},
			{
				name: 'is not an object',
				value: 'some value',
			},
		].forEach(testCase => {
			it(`throws a TypeError for the effect parameter if the effect parameter ${testCase.name}`, () => {
				expect(() => convertConditionalEffectToBuffs(testCase.value, { arbitraryContext: 'some context' }))
					.toThrowMatching((err) => err instanceof TypeError && err.message === expectedEffectErrorMessage);
			});

			it(`throws a TypeError for the context parameter if the context parameter ${testCase.name}`, () => {
				expect(() => convertConditionalEffectToBuffs({ arbitraryEffect: 'some effect' }, testCase.value))
					.toThrowMatching((err) => err instanceof TypeError && err.message === expectedContextErrorMessage);
			});
		});
	});

	describe('for conditional effects that cannot be processed yet', () => {
		const unsupportedEffectId = 'unsupported effect id';

		it('returns an array containing a single buff denoting an unknown entry for a conditional effect', () => {
			const effect = generateArbitraryEffect(unsupportedEffectId);
			const context = generateArbitraryContext();

			const result = convertConditionalEffectToBuffs(effect, context);
			expectUnknownBuffResult(result, unsupportedEffectId);
		});

		it('returns an array containing a single buff denoting an unknown entry for a non-effect object', () => {
			const effect = generateArbitraryEffect(unsupportedEffectId);
			const context = generateArbitraryContext();

			effect.id = void 0;
			delete effect.id;

			const result = convertConditionalEffectToBuffs(effect, context);
			expectUnknownBuffResult(result, KNOWN_CONDITIONAL_ID.Unknown);
		});
	});

	it('returns the result of the conversion function of a known passive effect ID', () => {
		const effectId = 'arbitrary effect id';
		const mockBuffResult = [{ id: effectId, some: 'buff result' }];
		const mockConversionFunction = jasmine.createSpy('mockConversionFunction');
		mockConversionFunction.and.returnValue(mockBuffResult.slice());
		const mapping = getConditionalEffectToBuffMapping();
		mapping.set(effectId, mockConversionFunction);

		const effect = generateArbitraryEffect(effectId);
		const context = generateArbitraryContext();
		const result = convertConditionalEffectToBuffs(effect, context);
		expect(mockConversionFunction).toHaveBeenCalledWith(effect, context);
		expect(result).toEqual(mockBuffResult);
	});

	it('reloads the passive mapping if context.reloadMapping is true', () => {
		const effectId = 'arbitrary effect id';
		const mockConversionFunction = jasmine.createSpy('mockConversionFunction');
		const mapping = getConditionalEffectToBuffMapping();
		mapping.set(effectId, mockConversionFunction);

		const effect = generateArbitraryEffect(effectId);
		const context = generateArbitraryContext({ reloadMapping: true });
		const result = convertConditionalEffectToBuffs(effect, context);
		expect(mockConversionFunction).not.toHaveBeenCalled();
		expect(getConditionalEffectToBuffMapping().has(effectId))
			.withContext('conditional mapping should not have arbitrary effect id')
			.toBeFalse();
		expectUnknownBuffResult(result, effectId);
	});
});
