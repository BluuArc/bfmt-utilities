const testConstants = require('../_test-helpers/constants');
const { PROC_METADATA, PASSIVE_METADATA } = require('./effect-metadata');
const getEffectName = require('./getEffectName').default;

describe('getEffectName method', () => {
	const expectNonEmptyString = (result, expected) => {
		// use 2 expects to guard against result or expected being an empty string
		expect(result.length)
			.withContext('result is an empty etring')
			.toBeGreaterThan(0);
		expect(result).toBe(expected);
	};

	[
		{
			name: 'is undefined',
			value: (void 0),
		},
		{
			name: 'is null',
			value: null,
		},
		{
			name: 'is not an object',
			value: 123,
		},
		{
			name: 'is an object but it does not have any of the ID keys',
			value: { some: 'property' },
		},
	].forEach(testCase => {
		it(`returns an empty string when the effect parameter ${testCase.name}`, () => {
			expect(getEffectName(testCase.value)).toBe('');
		});
	});

	['proc', 'passive'].forEach(effectType => {
		[false, true].forEach(hasUnknownEffectId => {
			const arbitraryId = 'arbitrary id';
			const arbitraryMissingId = 'arbitrary missing id';
			const arbitraryName = 'arbitrary name';

			describe(`for a ${effectType} effect with ${hasUnknownEffectId ? 'an unknown' : 'a known'} ID`, () => {
				describe('for invalid metadata inputs', () => {
					[
						{
							name: 'is null',
							value: null,
						},
						{
							name: 'is not an object',
							value: 'some value',
						},
					].forEach(metadataTestCase => {
						it(`returns an empty string when the metadata.${effectType} parameter ${metadataTestCase.name}`, () => {
							const effect = { [`${hasUnknownEffectId ? 'unknown ' : ''}${effectType} id`]: arbitraryId };
							expect(getEffectName(effect, metadataTestCase.value)).toBe('');
						});
					});
				});

				describe('when a valid metadata object is passed in', () => {
					[
						{
							input: arbitraryMissingId,
							name: `a ${effectType} id not in the metadata`,
						},
						{
							input: arbitraryId,
							name: `a ${effectType} id without a Name`,
						},
					].forEach(testCase => {
						it(`returns an empty string for ${testCase.name}`, () => {
							const effect = { [`${hasUnknownEffectId ? 'unknown ' : ''}${effectType} id`]: testCase.input };
							const metadata = { [arbitraryId]: { ID: arbitraryId } };
							const result = getEffectName(effect, { [effectType]: metadata });
							expect(result).toBe('');
						});
					});

					it('returns the Name field is of a given metadata entry', () => {
						const effect = { [`${hasUnknownEffectId ? 'unknown ' : ''}${effectType} id`]: arbitraryId };
						const metadata = { [arbitraryId]: { ID: arbitraryId, Name: arbitraryName } };
						const result = getEffectName(effect, { [effectType]: metadata });
						expectNonEmptyString(result, arbitraryName);
					});
				});

				it(`defaults to ${effectType.toUpperCase}_METADATA when metadata is not specified`, () => {
					let effectId;
					let expectedNameValue;
					if (effectType === 'passive') {
						effectId = testConstants.KNOWN_ARBITRARY_PASSIVE_ID;
						expectedNameValue = PASSIVE_METADATA[testConstants.KNOWN_ARBITRARY_PASSIVE_ID].Name;
					} else if (effectType === 'proc') {
						effectId = testConstants.KNOWN_ARBITRARY_ATTACKING_PROC_ID;
						expectedNameValue = PROC_METADATA[testConstants.KNOWN_ARBITRARY_ATTACKING_PROC_ID].Name;
					}
					const effect = { [`${hasUnknownEffectId ? 'unknown ' : ''}${effectType} id`]: effectId };
					expectNonEmptyString(getEffectName(effect), expectedNameValue);
				});
			});
		});
	});
});
