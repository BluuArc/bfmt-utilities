const testConstants = require('../_test-helpers/constants');
const buffConstants = require('../buffs/constants');
const { generateDamageFramesList } = require('../_test-helpers/dataFactories');
const { getStringValueForLog } = require('../_test-helpers/utils');
const { ProcBuffType } = require('../buffs/buff-metadata');
const getExtraAttackDamageFramesEntry = require('./getExtraAttackDamageFramesEntry').default;

describe('getExtraAttackDamageFramesEntry method', () => {
	const ARBITRARY_DELAY = 'arbitrary delay';
	/**
	 * @param {import('../../src/datamine-types').IDamageFramesEntry} result
	 * @param {import('../../src/datamine-types').IDamageFramesEntry} expected
	 */
	const assertDamageFramesEntry = (result, expected) => {
		const isPopulatedObject = !!result && typeof result === 'object';
		expect(isPopulatedObject).withContext(`Result [${getStringValueForLog(result)}] is not a populated object`).toBe(true);
		if (isPopulatedObject) {
			expect(result['effect delay time(ms)/frame']).withContext('effect delay time/frame mismatch').toBe(expected['effect delay time(ms)/frame']);
			expect(result['frame times']).withContext('frame time array mismatch').toEqual(expected['frame times']);
			expect(result['hit dmg% distribution']).withContext('damage distribution array mismatch').toEqual(expected['hit dmg% distribution']);
			expect(result['hit dmg% distribution (total)']).withContext('total damage distribution mismatch').toEqual(expected['hit dmg% distribution (total)']);
			expect(result.hits).withContext('hit count mismatch').toBe(expected.hits);
		}
	};

	/**
	 * @param {object} args
	 * @param {string?} args.delay
	 * @param {number[]?} args.frames
	 * @param {number[]?} args.damageDistribution
	 * @param {number?} args.damageTotal
	 * @param {number?} args.hits
	 * @returns {import('../../src/datamine-types').IDamageFramesEntry}
	 */
	const createDamageFramesEntry = ({ delay = '', frames = [], damageDistribution = [], damageTotal = 0, hits = 0 }) => ({
		'effect delay time(ms)/frame': delay,
		'frame times': frames,
		'hit dmg% distribution': damageDistribution,
		'hit dmg% distribution (total)': damageTotal,
		hits,
	});
	const emptyDamageFramesEntry = createDamageFramesEntry(({
		delay: ARBITRARY_DELAY,
		frames: [],
		damageDistribution: [],
		damageTotal: 0,
		hits: 0,
	}));

	describe('for invalid values for damageFrames', () => {
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
				value: 'some string',
			},
			{
				name: 'is an object but not an array',
				value: { some: 'property' },
			},
			{
				name: 'is an array but has no valid ID properties in its entries',
				value: [{ some: 'property' }, { some: 'other property' }],
			},
		].forEach(testCase => {
			it(`returns an empty damage frames entry if damageFrames ${testCase.name}`, () => {
				const result = getExtraAttackDamageFramesEntry(testCase.value, ARBITRARY_DELAY);
				assertDamageFramesEntry(result, emptyDamageFramesEntry);
			});
		});
	});

	describe('for the effectDelay parameter', () => {
		it('defaults to a delay of 0.0/0 if a value is passed in for effectDelay', () => {
			const expectedResult = createDamageFramesEntry({ delay: '0.0/0' });
			const result = getExtraAttackDamageFramesEntry([]);
			assertDamageFramesEntry(result, expectedResult);
		});

		it('uses the passed in value for effectDelay', () => {
			const expectedResult = createDamageFramesEntry({ delay: ARBITRARY_DELAY });
			const result = getExtraAttackDamageFramesEntry([], ARBITRARY_DELAY);
			assertDamageFramesEntry(result, expectedResult);
		});
	});

	describe('when the damageFrames parameter is a non-empty array', () => {
		describe('for when there is one applicable frame entry', () => {
			const arbitraryAttackingId = 'arbitrary attacking id';
			const arbitraryNonAttackingId = 'arbitrary non attacking id';

			[
				{
					name: 'an attacking proc ID',
					index: 1,
					key: 'proc id',
					valueAtIndex: arbitraryAttackingId,
					valueAtOtherIndices: arbitraryNonAttackingId,
				},
				{
					name: 'an attacking proc ID that is considered unknown',
					index: 2,
					key: 'unknown proc id',
					valueAtIndex: arbitraryAttackingId,
					valueAtOtherIndices: arbitraryNonAttackingId,
				},
				{
					name: 'the burst heal proc ID',
					index: 1,
					key: 'proc id',
					valueAtIndex: buffConstants.KNOWN_PROC_ID.BurstHeal,
					valueAtOtherIndices: arbitraryNonAttackingId,
				},
			].forEach(testCase => {
				it(`returns an identical result when the applicable frame entry has ${testCase.name} and metadata is passed in`, () => {
					const inputFrames = generateDamageFramesList(10, undefined, (obj, index) => {
						obj[testCase.key] = index === testCase.index
							? arbitraryAttackingId
							: arbitraryNonAttackingId;
						return obj;
					});
					const metadata = {
						[arbitraryAttackingId]: {
							ID: arbitraryAttackingId,
							Type: ProcBuffType.Attack,
						},
						[arbitraryNonAttackingId]: {
							ID: arbitraryNonAttackingId,
							Type: 'arbitrary non attacking type',
						},
					};
					const expectedResult = {
						...inputFrames[testCase.index],
						'effect delay time(ms)/frame': ARBITRARY_DELAY,
					};
					const result = getExtraAttackDamageFramesEntry(inputFrames, ARBITRARY_DELAY, metadata);
					assertDamageFramesEntry(result, expectedResult);
				});
			});

			it('defaults to PROC_METADATA when metadata is not specified', () => {
				const indexWithAttackingProcId = 1;

				const inputFrames = generateDamageFramesList(10, undefined, (obj, index) => {
					obj['proc id'] = index === indexWithAttackingProcId
						? testConstants.KNOWN_ARBITRARY_ATTACKING_PROC_ID
						: testConstants.KNOWN_ARBITRARY_NON_ATTACKING_PROC_ID;
					return obj;
				});
				const expectedResult = {
					...inputFrames[indexWithAttackingProcId],
					'effect delay time(ms)/frame': ARBITRARY_DELAY,
				};
				const result = getExtraAttackDamageFramesEntry(inputFrames, ARBITRARY_DELAY);
				assertDamageFramesEntry(result, expectedResult);
			});
		});

		it('returns an empty damage frames entry if there are no applicable frame entries', () => {
			const inputFrames = generateDamageFramesList(10, undefined, (obj) => {
				obj['proc id'] = testConstants.KNOWN_ARBITRARY_NON_ATTACKING_PROC_ID;
				return obj;
			});
			const result = getExtraAttackDamageFramesEntry(inputFrames, ARBITRARY_DELAY);
			assertDamageFramesEntry(result, emptyDamageFramesEntry);
		});

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
			].forEach(testCase => {
				it(`returns empty array returns an empty damage frames entry if there are no applicable frame entries and the metadata parameter ${testCase.name}`, () => {
					const inputFrames = generateDamageFramesList(10, undefined, (obj) => {
						obj['proc id'] = testConstants.KNOWN_ARBITRARY_ATTACKING_PROC_ID;
						return obj;
					});
					const result = getExtraAttackDamageFramesEntry(inputFrames, ARBITRARY_DELAY, testCase.value);
					assertDamageFramesEntry(result, emptyDamageFramesEntry);
				});
			});
		});
	});

	it('correctly drops the first frame and distribution entries for frame entries after the first applicable frame', () => {
		const inputFrames = generateDamageFramesList(5, undefined, (obj, index) => {
			// mark even frames as attacking frames
			obj['proc id'] = index % 2 === 0
				? testConstants.KNOWN_ARBITRARY_ATTACKING_PROC_ID
				: testConstants.KNOWN_ARBITRARY_NON_ATTACKING_PROC_ID;
			return obj;
		});

		// compute expected result from input frames
		const expectedApplicableFrames = inputFrames.filter(f => f['proc id'] === testConstants.KNOWN_ARBITRARY_ATTACKING_PROC_ID);
		const frameDamagePairs = expectedApplicableFrames.reduce((acc, frame, frameIndex) => {
			// conditionally drop the first entry of each array
			const expectedFrameTimesForFrame = frame['frame times'].slice(frameIndex > 0 ? 1 : 0);
			const expectedDamageDistributionsForFrame = frame['hit dmg% distribution'].slice(frameIndex > 0 ? 1 : 0);
			expectedFrameTimesForFrame.forEach((time, index) => {
				acc.push({
					time,
					dmg: expectedDamageDistributionsForFrame[index],
				});
			});
			return acc;
		}, []).sort((a, b) => a.time - b.time);
		const expectedResult = {
			'effect delay time(ms)/frame': ARBITRARY_DELAY,
			'frame times': frameDamagePairs.map(({ time }) => time),
			'hit dmg% distribution': frameDamagePairs.map(({ dmg }) => dmg),
			'hit dmg% distribution (total)': frameDamagePairs.reduce((acc, { dmg }) => acc + dmg, 0),
			hits: frameDamagePairs.length,
		};
		// ensure correctness of expected result
		expect(expectedResult['hit dmg% distribution (total)']).not.toBeNaN();
		expect(expectedResult.hits).not.toBeNaN();

		const result = getExtraAttackDamageFramesEntry(inputFrames, ARBITRARY_DELAY);
		assertDamageFramesEntry(result, expectedResult);
	});
});
