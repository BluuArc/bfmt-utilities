const getEffectsForItem = require('./getEffectsForItem').default;
const { getStringValueForLog } = require('../_test-helpers/utils');

describe('getEffectsForItem method', () => {
	describe('for invalid values for item', () => {
		[
			{
				name: 'is null',
				value: null,
			},
			{
				name: 'is undefined',
				value: void 0,
			},
			{
				name: 'is not an object',
				value: 'some string',
			},
			{
				name: 'is an object without an effect property',
				value: { some: 'property' },
			},
			{
				name: 'is an object where obj.effect is not an object',
				value: { effect: 'some string' },
			},
			{
				name: 'is an object where obj.effect.effect does not exist',
				value: { effect: { some: 'property' } },
			},
			{
				name: 'is an object where obj.effect.effect is not an array',
				value: { effect: { effect: 'some string' } },
			},
		].forEach(testCase => {
			it(`returns an empty array if item parameter ${testCase.name}`, () => {
				expect(getEffectsForItem(testCase.value)).toEqual([]);
			});
		});
	});

	it('returns the effects array of the given item when item.effect is an array (i.e. sphere)', () => {
		const inputItem = { effect: [{ some: 'effect' }] };
		expect(getEffectsForItem(inputItem)).toBe(inputItem.effect);
	});

	describe('when item.effect is an object (i.e. a consumable item)', () => {
		it('returns a modified effects array of the given item', () => {
			const numberOfEffects = 10;
			const ARBITRARY_TARGET_AREA = 'arbitrary target area';
			const ARBITRARY_TARGET_TYPE = 'arbitrary target type';
			const inputItem = {
				effect: {
					effect: Array.from({ length: numberOfEffects }, (_, i) => ({ some: `effect-${i}` })),
					target_area: ARBITRARY_TARGET_AREA,
					target_type: ARBITRARY_TARGET_TYPE,
				},
			};
			const expectedEffects = inputItem.effect.effect.map(e => ({
				...e,
				'target area': ARBITRARY_TARGET_AREA,
				'target type': ARBITRARY_TARGET_TYPE,
			}));
			const result = getEffectsForItem(inputItem);
			expect(result).toEqual(expectedEffects);
		});

		it('returns a modified effects array that overrides the target data within the effects with the item\'s target data', () => {
			const numberOfEffects = 10;
			const ARBITRARY_TARGET_AREA = 'arbitrary target area';
			const ARBITRARY_TARGET_TYPE = 'arbitrary target type';
			const inputItem = {
				effect: {
					effect: Array.from({ length: numberOfEffects }, (_, i) => ({
						some: `effect-${i}`,
						'target area': `target-area-${i}`,
						'target type': `target-type-${i}`,
					})),
					target_area: ARBITRARY_TARGET_AREA,
					target_type: ARBITRARY_TARGET_TYPE,
				},
			};
			const result = getEffectsForItem(inputItem);
			expect(Array.isArray(result)).withContext(`result was not an array [${getStringValueForLog(result)}]`).toBe(true);
			expect(result.length).withContext('result length did not match expected length').toBe(numberOfEffects);
			result.forEach((resultEffect, i) => {
				expect(resultEffect['target area']).withContext(`target area mismatch at index ${i}`).toBe(ARBITRARY_TARGET_AREA);
				expect(resultEffect['target type']).withContext(`target type mismatch at index ${i}`).toBe(ARBITRARY_TARGET_TYPE);
			});
		});
	});
});
