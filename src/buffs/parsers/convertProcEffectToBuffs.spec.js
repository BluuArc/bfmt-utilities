const { BuffStackType } = require('./buff-types');
const { KNOWN_PROC_ID } = require('../constants');
const { getProcMapping } = require('./procMapping');
const convertProcEffectToBuffs = require('./convertProcEffectToBuffs').default;

describe('convertProcEffectToBuff method', () => {
	const arbitrarySource = 'arbitrary source';
	const arbitrarySourceId = 'arbitrary source id';
	const arbitraryEffectDelay = 'arbitrary effect delay';
	const arbitraryTargetType = 'arbitrary target type';
	const arbitraryTargetArea = 'arbitrary target area';

	/**
	 * @returns {import('../../datamine-types').IProcEffect}
	 */
	const generateArbitraryEffect = (id, params = {}) => ({
		'proc id': id,
		'effect delay time(ms)/frame': arbitraryEffectDelay,
		'target type': arbitraryTargetType,
		'target area': arbitraryTargetArea,
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
				id,
				originalId: id,
				stackType: BuffStackType.Unknown,
				effectDelay: arbitraryEffectDelay,
				targetType: arbitraryTargetType,
				targetArea: arbitraryTargetArea,
				sources: [`${arbitrarySource}-${arbitrarySourceId}`],
			});
	};

	beforeEach(() => {
		// start with a fresh copy of the proc mapping on every test
		getProcMapping(true);
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
				expect(() => convertProcEffectToBuffs(testCase.value, { arbitraryContext: 'some context' }))
					.toThrowMatching((err) => err instanceof TypeError && err.message === expectedEffectErrorMessage);
			});

			it(`throws a TypeError for the context parameter if the context parameter ${testCase.name}`, () => {
				expect(() => convertProcEffectToBuffs({ arbitraryEffect: 'some effect' }, testCase.value))
					.toThrowMatching((err) => err instanceof TypeError && err.message === expectedContextErrorMessage);
			});
		});
	});

	describe('for proc effects that cannot be processed yet', () => {
		const unsupportedEffectId = 'unsupported effect id';

		it('returns an array containing a single buff denoting an unknown entry for a proc effect', () => {
			const effect = generateArbitraryEffect(unsupportedEffectId);
			const context = generateArbitraryContext();

			const result = convertProcEffectToBuffs(effect, context);
			expectUnknownBuffResult(result, unsupportedEffectId);
		});

		it('returns an array containing a single buff denoting an unknown entry for a proc effect with an unknown proc id', () => {
			const effect = generateArbitraryEffect(unsupportedEffectId);
			const context = generateArbitraryContext();

			effect['proc id'] = void 0;
			delete effect['proc id'];
			effect['unknown proc id'] = unsupportedEffectId;

			const result = convertProcEffectToBuffs(effect, context);
			expectUnknownBuffResult(result, unsupportedEffectId);
		});

		it('returns an array containing a single buff denoting an unknown entry for a non-proc effect', () => {
			const effect = generateArbitraryEffect(unsupportedEffectId);
			const context = generateArbitraryContext();

			effect['proc id'] = void 0;
			delete effect['proc id'];
			effect['passive id'] = unsupportedEffectId;

			const result = convertProcEffectToBuffs(effect, context);
			expectUnknownBuffResult(result, KNOWN_PROC_ID.Unknown);
		});

		it('returns an array containing a single buff denoting an unknown entry for a non-effect object', () => {
			const effect = generateArbitraryEffect(unsupportedEffectId);
			const context = generateArbitraryContext();

			effect['proc id'] = void 0;
			delete effect['proc id'];

			const result = convertProcEffectToBuffs(effect, context);
			expectUnknownBuffResult(result, KNOWN_PROC_ID.Unknown);
		});
	});

	it('returns the result of the conversion function of a known proc effect ID', () => {
		const effectId = 'arbitrary effect id';
		const mockBuffResult = [{ id: effectId, some: 'buff result' }];
		const mockConversionFunction = jasmine.createSpy('mockConversionFunction');
		mockConversionFunction.and.returnValue(mockBuffResult.slice());
		const mapping = getProcMapping();
		mapping.set(effectId, mockConversionFunction);

		const effect = generateArbitraryEffect(effectId);
		const context = generateArbitraryContext();
		const result = convertProcEffectToBuffs(effect, context);
		expect(mockConversionFunction).toHaveBeenCalledWith(effect, context);
		expect(result).toEqual(mockBuffResult);
	});

	it('reloads the proc mapping if context.reloadMapping is true', () => {
		const effectId = 'arbitrary effect id';
		const mockConversionFunction = jasmine.createSpy('mockConversionFunction');
		const mapping = getProcMapping();
		mapping.set(effectId, mockConversionFunction);

		const effect = generateArbitraryEffect(effectId);
		const context = generateArbitraryContext({ reloadMapping: true });
		const result = convertProcEffectToBuffs(effect, context);
		expect(mockConversionFunction).not.toHaveBeenCalled();
		expect(getProcMapping().has(effectId))
			.withContext('proc mapping should not have arbitrary effect id')
			.toBeFalse();
		expectUnknownBuffResult(result, effectId);
	});
});
