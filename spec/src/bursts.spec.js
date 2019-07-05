import * as burstUtilities from '../../src/bursts';
import { generateInputPairsOfTypesExcept } from '../utils';

describe('bursts utilities', () => {
  const ARBITRARY_BC_COST = 123;
  const ARBITRARY_PROC_ID = '123';
  const ATTACKING_PROC_ID = '1';
  const NON_ATTACKING_PROC_ID = '2';
  const ARBITRARY_DROPCHECK_COUNT = 3;
  const ARBITRARY_EFFECT_DELAY = '16.7/1';
  const NUM_BURST_LEVELS = 10; // should be a number >= 2 for the following test cases
  const NUM_EFFECTS = 10; // should be a number >= 0
  const ARBITRARY_TARGET_AREA = 'some target area';
  const EFFECT_TEMPLATE_ARRAY = new Array(NUM_EFFECTS).fill(0);

  const assertEmptyArray = (input) => {
    expect(Array.isArray(input)).toBeTruthy('Result is not an array');
    expect(input.length).toBe(0, 'Result is not an empty array');
  };
  const getMockProcEffect = ({ isUnknown = false, id = '1', ...attrs } = {}) => ({
    [`${isUnknown ? 'unknown ' : ''}proc id`]: id,
    ...attrs,
  });
  const getMockBurst = (numLevels = 10) => {
    const levelsArray = new Array(numLevels).fill(0);
    return {
      levels: levelsArray.map(() => ({
        'bc cost': ARBITRARY_BC_COST,
        effects: [],
      })),
      'drop check count': ARBITRARY_DROPCHECK_COUNT,
    };
  };
  let mockBurst = getMockBurst(NUM_BURST_LEVELS);

  beforeEach(() => {
    mockBurst = getMockBurst(NUM_BURST_LEVELS);
  });

  describe('getLevelEntryForBurst', () => {
    const DEFAULT_RETURN_VALUE = {
      'bc cost': 0,
      effects: [],
    };
    const assertShape = (input, cost = 0, effects = []) => {
      expect(typeof input).toBe('object');
      expect(input['bc cost']).toBe(cost);
      expect(input.effects).toEqual(effects);
    };
    const assertDefaultShape = (input) => assertShape(input, DEFAULT_RETURN_VALUE['bc cost'], DEFAULT_RETURN_VALUE.effects);

    describe('for non-object burst inputs', () => {
      generateInputPairsOfTypesExcept(['object']).forEach(testCase => {
        it(`returns default values when burst input is ${testCase.name}`, () => {
          const result = burstUtilities.getLevelEntryForBurst(testCase.value);
          assertDefaultShape(result);
        });
      });
    });

    describe('when a level is specified', () => {
      it('returns the first burst level entry when the level is 1', () => {
        const expectedResult = mockBurst.levels[0];
        const actualResult = burstUtilities.getLevelEntryForBurst(mockBurst, 1);
        expect(expectedResult).toBeDefined();
        expect(actualResult).toBe(expectedResult);
      });

      it('returns the burst level entry at the specified level if it exists', () => {
        const EXISTING_LEVEL = NUM_BURST_LEVELS - 1;
        const expectedResult = mockBurst.levels[EXISTING_LEVEL - 1];
        const actualResult = burstUtilities.getLevelEntryForBurst(mockBurst, EXISTING_LEVEL);
        expect(expectedResult).toBeDefined();
        expect(actualResult).toBe(expectedResult);
      });

      it('returns default values when the level entry is out of bounds', () => {
        const NONEXISTENT_LEVEL = NUM_BURST_LEVELS + 1;
        const result = burstUtilities.getLevelEntryForBurst(mockBurst, NONEXISTENT_LEVEL);
        assertDefaultShape(result);
      });

      describe('for nun-numeric level inputs', () => {
        generateInputPairsOfTypesExcept(['number', 'undefined']).forEach(testCase => {
          it(`returns default values when level input is ${testCase.name}`, () => {
            const result = burstUtilities.getLevelEntryForBurst(mockBurst, testCase.value);
            assertDefaultShape(result);
          });
        });
      });
    });

    it('returns the last level entry if no level entry is specified', () => {
      const expectedResult = mockBurst.levels[NUM_BURST_LEVELS - 1];
      const actualResult = burstUtilities.getLevelEntryForBurst(mockBurst);
      expect(actualResult).toBe(expectedResult);
    });
  });

  describe('getBurstEffects', () => {
    beforeEach(() => {
      mockBurst.levels.forEach(levelEntry => {
        levelEntry.effects = EFFECT_TEMPLATE_ARRAY.map(() => getMockProcEffect({
          id: ARBITRARY_PROC_ID,
        }));
      });
    });

    describe('for non-object burst inputs', () => {
      generateInputPairsOfTypesExcept(['object']).forEach(testCase => {
        it(`returns an empty array when burst input is ${testCase.name}`, () => {
          const result = burstUtilities.getBurstEffects(testCase.value);
          assertEmptyArray(result);
        });
      });
    });

    describe('when a level is specified', () => {
      it('returns the first burst level entry when the level is 1', () => {
        const expectedResult = mockBurst.levels[0].effects;
        const actualResult = burstUtilities.getBurstEffects(mockBurst, 1);
        expect(expectedResult).toBeDefined();
        expect(actualResult).toBe(expectedResult);
      });

      it('returns the effects of the burst level entry at the specified level if it exists', () => {
        const EXISTING_LEVEL = NUM_BURST_LEVELS - 1;
        const expectedResult = mockBurst.levels[EXISTING_LEVEL - 1].effects;
        const actualResult = burstUtilities.getBurstEffects(mockBurst, EXISTING_LEVEL);
        expect(expectedResult).toBeDefined();
        expect(actualResult).toBe(expectedResult);
      });

      it('returns an empty array when the level entry is out of bounds', () => {
        const NONEXISTENT_LEVEL = NUM_BURST_LEVELS + 1;
        const result = burstUtilities.getBurstEffects(mockBurst, NONEXISTENT_LEVEL);
        assertEmptyArray(result);
      });

      describe('for nun-numeric level inputs', () => {
        generateInputPairsOfTypesExcept(['number', 'undefined']).forEach(testCase => {
          it(`returns an empty array when level input is ${testCase.name}`, () => {
            const result = burstUtilities.getBurstEffects(mockBurst, testCase.value);
            assertEmptyArray(result);
          });
        });
      });

      it('returns the last level entry if no level entry is specified', () => {
        const expectedResult = mockBurst.levels[NUM_BURST_LEVELS - 1].effects;
        const actualResult = burstUtilities.getBurstEffects(mockBurst);
        expect(actualResult).toBe(expectedResult);
      });
    });

    it('returns an empty array if the entry at the specified level does not have an effects property', () => {
      const ARBITRARY_VALID_LEVEL = 1;
      const correspondingEntry = mockBurst.levels[ARBITRARY_VALID_LEVEL - 1];
      expect(burstUtilities.getBurstEffects(mockBurst, ARBITRARY_VALID_LEVEL)).toBe(correspondingEntry.effects);
      delete correspondingEntry.effects;
      expect(correspondingEntry.effects).toBeUndefined();

      const result = burstUtilities.getBurstEffects(mockBurst, ARBITRARY_VALID_LEVEL);
      assertEmptyArray(result);
    });

    describe('for non-array-like effects properties', () => {
      generateInputPairsOfTypesExcept(['array']).forEach(testCase => {
        it(`returns an empty array if the entry at the specified level has an effect property that is ${testCase.name}`, () => {
          const ARBITRARY_VALID_LEVEL = 1;
          const correspondingEntry = mockBurst.levels[ARBITRARY_VALID_LEVEL - 1];
          correspondingEntry.effects = testCase.value;

          const result = burstUtilities.getBurstEffects(mockBurst, ARBITRARY_VALID_LEVEL);
          assertEmptyArray(result);
        });
      });
    });
  });

  describe('getBcDcInfo', () => {
    const DEFAULT_RETURN_VALUE = {
      cost: 0,
      hits: 0,
      dropchecks: 0,
    };

    const assertShape = (input, cost = 0, hits = 0, dropchecks = 0) => {
      expect(typeof input).toBe('object');
      expect(input.cost).toBe(cost);
      expect(input.hits).toBe(hits);
      expect(input.dropchecks).toBe(dropchecks);
    };
    const assertDefaultShape = (input) => assertShape(input,
      DEFAULT_RETURN_VALUE.cost,
      DEFAULT_RETURN_VALUE.hits,
      DEFAULT_RETURN_VALUE.dropchecks,
    );

    beforeEach(() => {
      mockBurst.levels = mockBurst.levels.map((entry, i) => ({ ...entry, ['bc cost']: i }));
    });

    describe('for non-object burst inputs', () => {
      generateInputPairsOfTypesExcept(['object']).forEach(testCase => {
        it(`returns default values when burst input is ${testCase.name}`, () => {
          const result = burstUtilities.getBcDcInfo(testCase.value);
          assertDefaultShape(result);
        });
      });
    });

    const testCases = [
      {
        effects: EFFECT_TEMPLATE_ARRAY.map((_, i) => getMockProcEffect({ hits: i + 1, id: ATTACKING_PROC_ID })),
        expectedHits: EFFECT_TEMPLATE_ARRAY.reduce((acc, _, i) => acc + (i + 1), 0),
        name: 'only attacking effects with known proc IDs',
      },
      {
        effects: EFFECT_TEMPLATE_ARRAY.map((_, i) => getMockProcEffect({ hits: i + 1, id: ATTACKING_PROC_ID, isUnknown: true })),
        expectedHits: EFFECT_TEMPLATE_ARRAY.reduce((acc, _, i) => acc + (i + 1), 0),
        name: 'only attacking effects with unknown proc IDs',
      },
      {
        effects: EFFECT_TEMPLATE_ARRAY.map((_, i) => getMockProcEffect({ hits: (i + 1) % (NUM_EFFECTS / 2), id: ATTACKING_PROC_ID, isUnknown: i > (NUM_EFFECTS / 2) })),
        expectedHits: EFFECT_TEMPLATE_ARRAY.reduce((acc, _, i) => acc + ((i + 1) % (NUM_EFFECTS / 2)), 0),
        name: 'only attacking effects with both known and unknown proc IDs',
      },
      {
        effects: EFFECT_TEMPLATE_ARRAY.map((_, i) => getMockProcEffect({ hits: i + 1, id: NON_ATTACKING_PROC_ID })),
        expectedHits: 0,
        name: 'only non-attacking effects with known proc IDs',
      },
      {
        effects: EFFECT_TEMPLATE_ARRAY.map((_, i) => getMockProcEffect({ hits: i + 1, id: NON_ATTACKING_PROC_ID, isUnknown: true })),
        expectedHits: 0,
        name: 'only non-attacking effects with unknown proc IDs',
      },
      {
        effects: EFFECT_TEMPLATE_ARRAY.map((_, i) => getMockProcEffect({ hits: (i + 1) % (NUM_EFFECTS / 2), id: NON_ATTACKING_PROC_ID, isUnknown: i > (NUM_EFFECTS / 2) })),
        expectedHits: 0,
        name: 'only non-attacking effects with both known and unknown proc IDs',
      },
      {
        effects: EFFECT_TEMPLATE_ARRAY.map((_, i) => getMockProcEffect({ hits: (i + 1) % (NUM_EFFECTS / 2), id: ATTACKING_PROC_ID, isUnknown: i > (NUM_EFFECTS / 2) }))
          .concat(EFFECT_TEMPLATE_ARRAY.map((_, i) => getMockProcEffect({ hits: (i + 1) % (NUM_EFFECTS / 2), id: NON_ATTACKING_PROC_ID, isUnknown: i > (NUM_EFFECTS / 2) }))),
        expectedHits: EFFECT_TEMPLATE_ARRAY.reduce((acc, _, i) => acc + ((i + 1) % (NUM_EFFECTS / 2)), 0),
        name: 'attacking and non-attacking effects with both known and unknown proc IDs',
      },
    ];
    describe('when a level is specified', () => {
      testCases.forEach((testCase) => {
        it(`returns the data for the first burst level entry when the level is 1 and the effects entry has ${testCase.name}`, () => {
          const correspondingEntry = mockBurst.levels[0];
          expect(correspondingEntry).toBeDefined();
          correspondingEntry.effects = testCase.effects;

          const actualResult = burstUtilities.getBcDcInfo(mockBurst, 1);
          assertShape(actualResult, correspondingEntry['bc cost'], testCase.expectedHits, testCase.expectedHits * mockBurst['drop check count']);
        });

        it(`returns the effects of the burst level entry at the specified level if it exists and the effects entry has ${testCase.name}`, () => {
          const EXISTING_LEVEL = NUM_BURST_LEVELS - 1;
          const correspondingEntry = mockBurst.levels[EXISTING_LEVEL - 1];
          expect(correspondingEntry).toBeDefined();
          correspondingEntry.effects = testCase.effects;

          const actualResult = burstUtilities.getBcDcInfo(mockBurst, EXISTING_LEVEL);
          assertShape(actualResult, correspondingEntry['bc cost'], testCase.expectedHits, testCase.expectedHits * mockBurst['drop check count']);
        });
      });

      it('returns default values when the level entry is out of bounds', () => {
        const NONEXISTENT_LEVEL = NUM_BURST_LEVELS + 1;
        const result = burstUtilities.getBcDcInfo(mockBurst, NONEXISTENT_LEVEL);
        assertDefaultShape(result);
      });

      describe('for nun-numeric level inputs', () => {
        generateInputPairsOfTypesExcept(['number', 'undefined']).forEach(testCase => {
          it(`returns default values when level input is ${testCase.name}`, () => {
            const result = burstUtilities.getBcDcInfo(mockBurst, testCase.value);
            assertDefaultShape(result);
          });
        });
      });
    });

    testCases.forEach(testCase => {
      it(`returns the last level entry if no level entry is specified and the effects entry has ${testCase.name}`, () => {
        const correspondingEntry = mockBurst.levels[NUM_BURST_LEVELS - 1];
        expect(correspondingEntry).toBeDefined();
        correspondingEntry.effects = testCase.effects;

        const actualResult = burstUtilities.getBcDcInfo(mockBurst);
        assertShape(actualResult, correspondingEntry['bc cost'], testCase.expectedHits, testCase.expectedHits * mockBurst['drop check count']);
      });
    });

    it('returns default values if the entry at the specified level does not have an effects property', () => {
      const ARBITRARY_VALID_LEVEL = 1;
      const correspondingEntry = mockBurst.levels[ARBITRARY_VALID_LEVEL - 1];
      delete correspondingEntry.effects;
      expect(correspondingEntry.effects).toBeUndefined();

      const result = burstUtilities.getBcDcInfo(mockBurst, ARBITRARY_VALID_LEVEL);
      assertDefaultShape(result);
    });

    describe('for non-array-like effects properties', () => {
      generateInputPairsOfTypesExcept(['array']).forEach(testCase => {
        it(`returns default values if the entry at the specified level has an effect property that is ${testCase.name}`, () => {
          const ARBITRARY_VALID_LEVEL = 1;
          const correspondingEntry = mockBurst.levels[ARBITRARY_VALID_LEVEL - 1];
          expect(correspondingEntry).toBeDefined();
          correspondingEntry.effects = testCase.value;

          const result = burstUtilities.getBcDcInfo(mockBurst, ARBITRARY_VALID_LEVEL);
          assertDefaultShape(result);
        });
      });
    });

    it('reads from the corresponding damage frames entry for hit count if the hits property doesn\'t exist on effects' , () => {
      const ARBITRARY_VALID_LEVEL = 1;
      const correspondingEntry = mockBurst.levels[ARBITRARY_VALID_LEVEL - 1];
      expect(correspondingEntry).toBeDefined();
      correspondingEntry.effects = EFFECT_TEMPLATE_ARRAY.map((_, i) => getMockProcEffect({ id: ATTACKING_PROC_ID, hits: (i % 2 === 0) ? (i + 1) : undefined }));
      mockBurst['damage frames'] = EFFECT_TEMPLATE_ARRAY.map((_, i) => ((i % 2 === 1) ? { hits: i + 1} : {}));
      const expectedHits = EFFECT_TEMPLATE_ARRAY.reduce((acc, _, i) => acc + (i + 1), 0);

      const actualResult = burstUtilities.getBcDcInfo(mockBurst, ARBITRARY_VALID_LEVEL);
      assertShape(actualResult, correspondingEntry['bc cost'], expectedHits, expectedHits * mockBurst['drop check count']);
    });

    it('defaults the number of hits to 0 if no hits property nor associated damage frames property is present', () => {
      const ARBITRARY_VALID_LEVEL = 1;
      const correspondingEntry = mockBurst.levels[ARBITRARY_VALID_LEVEL - 1];
      expect(correspondingEntry).toBeDefined();
      correspondingEntry.effects = EFFECT_TEMPLATE_ARRAY.map(() => getMockProcEffect({ id: ATTACKING_PROC_ID }));

      const result = burstUtilities.getBcDcInfo(mockBurst, ARBITRARY_VALID_LEVEL);
      assertShape(result, DEFAULT_RETURN_VALUE.cost, 0, 0);
    });

    it('defaults the cost to 0 if no bc cost property is present', () => {
      const ARBITRARY_VALID_LEVEL = 1;
      const correspondingEntry = mockBurst.levels[ARBITRARY_VALID_LEVEL - 1];
      delete correspondingEntry['bc cost'];
      expect(correspondingEntry['bc cost']).toBeUndefined();

      const result = burstUtilities.getBcDcInfo(mockBurst, ARBITRARY_VALID_LEVEL);
      assertShape(result, 0, 0, 0);
    });

    it('defaults the drop check count to 0 no drop check property is present', () => {
      delete mockBurst['drop check count'];
      expect(mockBurst['drop check count']).toBeUndefined();
      const ARBITRARY_VALID_LEVEL = 1;
      const correspondingEntry = mockBurst.levels[ARBITRARY_VALID_LEVEL - 1];
      correspondingEntry.effects = EFFECT_TEMPLATE_ARRAY.map((_, i) => getMockProcEffect({ id: ATTACKING_PROC_ID, hits: i + 1 }));
      const expectedHits = EFFECT_TEMPLATE_ARRAY.reduce((acc, _, i) => acc + i + 1, 0);
      const result = burstUtilities.getBcDcInfo(mockBurst, ARBITRARY_VALID_LEVEL);
      assertShape(result, DEFAULT_RETURN_VALUE.cost, expectedHits, 0);
    });
  });

  describe('getHitCountData', () => {
    const assertProperty = (obj = {}, prop = '', value) => {
      expect(obj.hasOwnProperty(prop)).toBeTruthy();
      expect(obj[prop]).toEqual(value);
    };
    const assertShape = (actual = [], expected = []) => {
      const PROPS_TO_COMPARE = ['damageFramesEntry', 'delay', 'effects', 'id', 'target'];
      expect(actual.length).toBe(expected.length);
      actual.forEach((entry, i) => {
        const correspondingExpectedEntry = expected[i];
        expect(correspondingExpectedEntry).toBeDefined();
        PROPS_TO_COMPARE.forEach(prop => {
          assertProperty(entry, prop, correspondingExpectedEntry[prop]);
        });
      });
    };

    describe('for non-object burst inputs', () => {
      generateInputPairsOfTypesExcept(['object']).forEach(testCase => {
        it(`returns an empty array if the burst input is ${testCase.name}`, () => {
          const result = burstUtilities.getHitCountData(testCase.value);
          assertEmptyArray(result);
        });
      });
    });

    it('returns all attacking frames when no filter function is specified', () => {
      const LAST_LEVEL = NUM_BURST_LEVELS - 1;
      const correspondingEntry = mockBurst.levels[LAST_LEVEL];
      correspondingEntry.effects = EFFECT_TEMPLATE_ARRAY.map((_, i) => getMockProcEffect({
        id: (i % 2 === 0) ? ATTACKING_PROC_ID : NON_ATTACKING_PROC_ID,
        'effect delay time(ms)/frame': ARBITRARY_EFFECT_DELAY,
        'target area': ARBITRARY_TARGET_AREA,
      }));
      mockBurst['damage frames'] = EFFECT_TEMPLATE_ARRAY.map((_, i) => ({
        'proc id': (i % 2 === 0) ? ATTACKING_PROC_ID : NON_ATTACKING_PROC_ID,
      }));

      const expectedResult = correspondingEntry.effects
        .map((_, i) => ({
          damageFramesEntry: mockBurst['damage frames'][i],
          delay: ARBITRARY_EFFECT_DELAY,
          effects: mockBurst.levels[LAST_LEVEL].effects[i],
          id: mockBurst.levels[LAST_LEVEL].effects[i]['proc id'],
          target: ARBITRARY_TARGET_AREA,
        }))
        .filter(e => e.id === ATTACKING_PROC_ID);
      const result = burstUtilities.getHitCountData(mockBurst);
      assertShape(result, expectedResult);
    });

    describe('when a filter function is specified', () => {
      const LAST_LEVEL = NUM_BURST_LEVELS - 1;
      let correspondingEntry = mockBurst.levels[LAST_LEVEL];
      let expectedResult = [];
      let mockFilterFunction = jasmine.createSpy('Mock Filter Function');

      beforeEach(() => {
        correspondingEntry = mockBurst.levels[LAST_LEVEL];
        correspondingEntry.effects = EFFECT_TEMPLATE_ARRAY.map((_, i) => getMockProcEffect({
          id: ARBITRARY_PROC_ID,
          'effect delay time(ms)/frame': ARBITRARY_EFFECT_DELAY,
          'target area': ARBITRARY_TARGET_AREA,
        }));
        mockBurst['damage frames'] = EFFECT_TEMPLATE_ARRAY.map((_, i) => ({
          'proc id': ARBITRARY_PROC_ID,
        }));

        mockFilterFunction = jasmine.createSpy('Mock Filter Function');
        expectedResult = mockBurst.levels[LAST_LEVEL].effects
          .map((_, i) => ({
            damageFramesEntry: mockBurst['damage frames'][i],
            delay: ARBITRARY_EFFECT_DELAY,
            effects: mockBurst.levels[LAST_LEVEL].effects[i],
            id: mockBurst.levels[LAST_LEVEL].effects[i]['proc id'],
            target: ARBITRARY_TARGET_AREA,
          }));
      });

      it('calls filter function with transformed frame data', () => {
        burstUtilities.getHitCountData(mockBurst, mockFilterFunction);

        expectedResult.forEach((entry, i) => {
          // signature of Array.filter
          expect(mockFilterFunction).toHaveBeenCalledWith(
            jasmine.objectContaining(entry),
            i,
            jasmine.any(Array),
          );
        });
      });

      it('filters result based on filter function', () => {
        mockFilterFunction.and.returnValue(true);
        const result = burstUtilities.getHitCountData(mockBurst, mockFilterFunction);

        // because the mock filter function always returns true, it should return everything
        expect(result).toEqual(expectedResult);
      });
    });

    describe('target translations', () => {
      const LAST_LEVEL = NUM_BURST_LEVELS - 1;
      let correspondingEntry = mockBurst.levels[LAST_LEVEL];
      let mockFilterFunction = jasmine.createSpy('Mock Filter Function');

      beforeEach(() => {
        mockBurst['damage frames'] = [{ 'proc id': ARBITRARY_PROC_ID }];
        correspondingEntry = mockBurst.levels[LAST_LEVEL];
        mockFilterFunction = jasmine.createSpy('Mock Filter Function').and.returnValue(true);
      });

      [
        { target: 'random', expected: 'RT' },
        { target: 'aoe', expected: 'AOE' },
        { target: 'single', expected: 'ST' },
      ].forEach(testCase => {
        it(`returns correct translation of target when the target area is ${testCase.target}`, () => {
          const mockEffect = testCase.target === 'random'
            ? getMockProcEffect({ id: ARBITRARY_PROC_ID, 'random attack': true })
            : getMockProcEffect({ id: ARBITRARY_PROC_ID, 'target area': testCase.target });
          correspondingEntry.effects = [mockEffect];

          const result = burstUtilities.getHitCountData(mockBurst, mockFilterFunction);
          expect(result.length).toBe(1);
          expect(result[0].target).toBe(testCase.expected);
        });
      });

      it('returns the original target area if no mapping exists for it', () => {
        const ARBITRARY_TARGET_AREA = 'some target area';
        correspondingEntry.effects = [getMockProcEffect({
          id: ARBITRARY_PROC_ID,
          'target area': ARBITRARY_TARGET_AREA,
        })];

        const result = burstUtilities.getHitCountData(mockBurst, mockFilterFunction);
        expect(result.length).toBe(1);
        expect(result[0].target).toBe(ARBITRARY_TARGET_AREA);
      });
    });
  });
});
