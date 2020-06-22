const { generateEffectsList, generateDamageFramesList } = require('../_test-helpers/dataFactories');
const datamineTypes = require('../datamine-types');
const combineEffectsAndDamageFrames = require('./combineEffectsAndDamageFrames').default;

describe('combineEffectsAndDamageFrames method', () => {
	describe('for invalid inputs', () => {
		const invalidArrayCases = [
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
			{
				name: 'is an object but not an array',
				value: { some: 'value' },
			},
		];
		invalidArrayCases.forEach(effectsCase => {
			invalidArrayCases.forEach(damageFramesCase => {
				it(`returns an empty array if the effects parameter ${effectsCase.name} and the damageFrames parameter ${damageFramesCase.name}`, () => {
					const result = combineEffectsAndDamageFrames(effectsCase.value, damageFramesCase.value);
					expect(result).toEqual([]);
				});
			});
		});
	});

	it('returns an empty array if the effects array is empty', () => {
		const result = combineEffectsAndDamageFrames([], []);
		expect(result).toEqual([]);
	});

	it('returns an empty array if the damage frames array is empty', () => {
		const effectsList = generateEffectsList(10);
		const damageFramesList = [];
		const result = combineEffectsAndDamageFrames(effectsList, damageFramesList);
		expect(result).toEqual([]);
	});

	it('returns an empty array if the length of the effects array does not match the length of the damage frames array', () => {
		const effectsList = generateEffectsList(10);
		const damageFramesList = generateDamageFramesList(9);
		const result = combineEffectsAndDamageFrames(effectsList, damageFramesList);
		expect(result).toEqual([]);
	});

	describe('when both effects array and damage frame arrays are the same length and correct shape', () => {
		const expectedResultKeys = ['delay', 'effect', 'frames', 'id', 'targetArea', 'targetType'].sort();
		/**
		 * @param {import('../../src/buffs').IProcEffectFrameComposite[]} result
		 * @param {import('../../src/datamine-types').ProcEffect[]} inputEffects
		 * @param {import('../../src/datamine-types').IDamageFramesEntry[]} damageFrames
		 */
		const assertResult = (result = [], inputEffects = [], inputDamageFrames = []) => {
			expect(result.length)
				.withContext(`Length of result array [${result.length}] did not match length of input effects array [${inputEffects.length}]`)
				.toBe(inputEffects.length);
			expect(result.length)
				.withContext(`Length of result array [${result.length}] did not match length of input damage frames array [${inputDamageFrames.length}]`)
				.toBe(inputDamageFrames.length);
			result.forEach((entry, index) => {
				const correspondingEffect = inputEffects[index];
				const correspondingDamageFrame = inputDamageFrames[index];

				expect(Object.keys(entry).sort())
					.withContext('key mismatch')
					.toEqual(expectedResultKeys);
				expect(entry.delay)
					.withContext('delay mismatch')
					.toBe(correspondingEffect['effect delay time(ms)/frame']);
				expect(entry.effect)
					.withContext('effect mismatch')
					.toBe(correspondingEffect);
				expect(entry.frames)
					.withContext('frames mismatch')
					.toBe(correspondingDamageFrame);

				if (correspondingEffect['proc id']) {
					expect(entry.id)
						.withContext('proc id mismatch')
						.toBe(correspondingEffect['proc id']);
				} else {
					expect(entry.id)
						.withContext('unknown proc id mismatch')
						.toBe(correspondingEffect['unknown proc id']);
				}

				if (correspondingEffect['random attack']) {
					expect(entry.targetArea)
						.withContext('target area mismatch')
						.toBe(datamineTypes.TargetArea.Random);
				} else {
					expect(entry.targetArea)
						.withContext('target area mismatch')
						.toBe(correspondingEffect['target area']);
				}

				expect(entry.targetType)
					.withContext('target type mismatch')
					.toBe(correspondingEffect['target type']);
			});
		};

		it('returns the expected composite values when using proc id', () => {
			const effectsList = generateEffectsList(10);
			const damageFramesList = generateDamageFramesList(10);
			const result = combineEffectsAndDamageFrames(effectsList, damageFramesList);
			assertResult(result, effectsList, damageFramesList);
		});

		it('returns the expected composite values when using unknown proc id', () => {
			const effectsList = generateEffectsList(10, (propName, index, defaultValue) => {
				switch (propName) {
				case 'unknown proc id':
					return `id-${index}`;
				case 'proc id':
					return undefined;
				default:
					return defaultValue;
				}
			});
			const damageFramesList = generateDamageFramesList(10);
			const result = combineEffectsAndDamageFrames(effectsList, damageFramesList);
			assertResult(result, effectsList, damageFramesList);
		});

		it('returns the expected composite values when using a mix of unknown proc id and proc id', () => {
			const effectsList = generateEffectsList(10, (propName, index, defaultValue) => {
				switch (propName) {
				case 'unknown proc id':
					return (index % 2 === 0) ? `id-${index}` : undefined;
				case 'proc id':
					return (index % 2 === 1) ? `id-${index}` : undefined;
				default:
					return defaultValue;
				}
			});
			const damageFramesList = generateDamageFramesList(10);
			const result = combineEffectsAndDamageFrames(effectsList, damageFramesList);
			assertResult(result, effectsList, damageFramesList);
		});

		it('returns the expected composite values when using effects with a target area of random attack', () => {
			const effectsList = generateEffectsList(10, (propName, index, defaultValue) => {
				switch (propName) {
				case 'random attack':
					return true;
				default:
					return defaultValue;
				}
			});
			const damageFramesList = generateDamageFramesList(10);
			const result = combineEffectsAndDamageFrames(effectsList, damageFramesList);
			assertResult(result, effectsList, damageFramesList);
		});

		it('returns the expected composite values when using effects with a mix of target areas including random attack', () => {
			const effectsList = generateEffectsList(10, (propName, index, defaultValue) => {
				switch (propName) {
				case 'random attack':
					return index % 2 === 0;
				default:
					return defaultValue;
				}
			});
			const damageFramesList = generateDamageFramesList(10);
			const result = combineEffectsAndDamageFrames(effectsList, damageFramesList);
			assertResult(result, effectsList, damageFramesList);
		});
	});
});
