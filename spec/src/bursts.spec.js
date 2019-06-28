import * as burstUtilities from '../../src/bursts';
import { generateInputPairsOfTypesExcept } from '../utils';

describe('bursts utilities', () => {
  const ARBITRARY_BC_COST = 123;
  const ARBITRARY_PROC_ID = '123';
  const ATTACKING_PROC_ID = '1';
  const NON_ATTACKING_PROC_ID = '2';
  const NUM_BURST_LEVELS = 10; // should be a number >= 2 for the following test cases

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
    const assertEmptyArray = (input) => {
      expect(Array.isArray(input)).toBeTruthy('Result is not an array');
      expect(input.length).toBe(0, 'Result is not an empty array');
    };

    const NUM_EFFECTS = 10; // should be a number >= 0
    const EFFECT_TEMPLATE_ARRAY = new Array(NUM_EFFECTS).fill(0);
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

  // tests for 1-indexed
});
