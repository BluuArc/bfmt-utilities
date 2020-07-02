const { KNOWN_PASSIVE_ID } = require('../constants');
const { getPassiveEffectToBuffMapping } = require('./passive-effect-mapping');
const { BuffId } = require('./buff-types');
const convertPassiveEffectToBuffs = require('./convertPassiveEffectToBuffs').default;

describe('convertPassiveEffectToBuffs method', () => {
	const arbitrarySource = 'arbitrary source';
	const arbitrarySourceId = 'arbitrary source id';

	/**
	 * @returns {import('../../datamine-types').IPassiveEffect}
	 */
	const generateArbitraryEffect = (id, params = {}) => ({
		'passive id': id,
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
				id: BuffId.UNKNOWN_PASSIVE_EFFECT_ID,
				originalId: id,
				sources: [`${arbitrarySource}-${arbitrarySourceId}`],
			});
	};

	beforeEach(() => {
		// start with a fresh copy of the passive mapping on every test
		getPassiveEffectToBuffMapping(true);
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
				expect(() => convertPassiveEffectToBuffs(testCase.value, { arbitraryContext: 'some context' }))
					.toThrowMatching((err) => err instanceof TypeError && err.message === expectedEffectErrorMessage);
			});

			it(`throws a TypeError for the context parameter if the context parameter ${testCase.name}`, () => {
				expect(() => convertPassiveEffectToBuffs({ arbitraryEffect: 'some effect' }, testCase.value))
					.toThrowMatching((err) => err instanceof TypeError && err.message === expectedContextErrorMessage);
			});
		});
	});

	describe('for passive effects that cannot be processed yet', () => {
		const unsupportedEffectId = 'unsupported effect id';

		it('returns an array containing a single buff denoting an unknown entry for a passive effect', () => {
			const effect = generateArbitraryEffect(unsupportedEffectId);
			const context = generateArbitraryContext();

			const result = convertPassiveEffectToBuffs(effect, context);
			expectUnknownBuffResult(result, unsupportedEffectId);
		});

		it('returns an array containing a single buff denoting an unknown entry for a passive effect with an unknown passive id', () => {
			const effect = generateArbitraryEffect(unsupportedEffectId);
			const context = generateArbitraryContext();

			effect['passive id'] = void 0;
			delete effect['passive id'];
			effect['unknown passive id'] = unsupportedEffectId;

			const result = convertPassiveEffectToBuffs(effect, context);
			expectUnknownBuffResult(result, unsupportedEffectId);
		});

		it('returns an array containing a single buff denoting an unknown entry for a non-passive effect', () => {
			const effect = generateArbitraryEffect(unsupportedEffectId);
			const context = generateArbitraryContext();

			effect['passive id'] = void 0;
			delete effect['passive id'];
			effect['proc id'] = unsupportedEffectId;

			const result = convertPassiveEffectToBuffs(effect, context);
			expectUnknownBuffResult(result, KNOWN_PASSIVE_ID.Unknown);
		});

		it('returns an array containing a single buff denoting an unknown entry for a non-effect object', () => {
			const effect = generateArbitraryEffect(unsupportedEffectId);
			const context = generateArbitraryContext();

			effect['passive id'] = void 0;
			delete effect['passive id'];

			const result = convertPassiveEffectToBuffs(effect, context);
			expectUnknownBuffResult(result, KNOWN_PASSIVE_ID.Unknown);
		});
	});

	it('returns the result of the conversion function of a known passive effect ID', () => {
		const effectId = 'arbitrary effect id';
		const mockBuffResult = [{ id: effectId, some: 'buff result' }];
		const mockConversionFunction = jasmine.createSpy('mockConversionFunction');
		mockConversionFunction.and.returnValue(mockBuffResult.slice());
		const mapping = getPassiveEffectToBuffMapping();
		mapping.set(effectId, mockConversionFunction);

		const effect = generateArbitraryEffect(effectId);
		const context = generateArbitraryContext();
		const result = convertPassiveEffectToBuffs(effect, context);
		expect(mockConversionFunction).toHaveBeenCalledWith(effect, context);
		expect(result).toEqual(mockBuffResult);
	});

	it('reloads the passive mapping if context.reloadMapping is true', () => {
		const effectId = 'arbitrary effect id';
		const mockConversionFunction = jasmine.createSpy('mockConversionFunction');
		const mapping = getPassiveEffectToBuffMapping();
		mapping.set(effectId, mockConversionFunction);

		const effect = generateArbitraryEffect(effectId);
		const context = generateArbitraryContext({ reloadMapping: true });
		const result = convertPassiveEffectToBuffs(effect, context);
		expect(mockConversionFunction).not.toHaveBeenCalled();
		expect(getPassiveEffectToBuffMapping().has(effectId))
			.withContext('passive mapping should not have arbitrary effect id')
			.toBeFalse();
		expectUnknownBuffResult(result, effectId);
	});
});
