import * as burstUtilities from '../../src/bursts';
import { generateInputPairsOfTypesExcept } from '../utils';

describe('bursts utilities', () => {
  const MOCK_PROC_EFFECT = { 'proc id': '1' };
  const MOCK_UNKNOWN_PROC_EFFECT = { 'unknown proc id': '48' };
  const ARBITRARY_BC_COST = 123;

  const getMockProcEffect = ({ isUnknown = false, id = '1' } = {}) => ({
    [`${isUnknown ? 'unknown ' : ''}proc id`]: id,
  });
  const getMockBurst = (numLevels = 10) => {
    const levelsArray = new Array(numLevels).fill(0);
    return {
      levels: levelsArray.map(() => ({
        'bc cost': ARBITRARY_BC_COST,
        effects: [],
      })),
    };
  }

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
      const NUM_BURST_LEVELS = 10; // should be a number >= 2 for the following test cases
      let mockBurst = getMockBurst(NUM_BURST_LEVELS);
      beforeEach(() =>{
        mockBurst = getMockBurst(NUM_BURST_LEVELS);
      });

      it('returns the burst level entry at the specified level if it exists', () => {
        const EXISTING_LEVEL = NUM_BURST_LEVELS - 1;
        const expectedResult = mockBurst.levels[EXISTING_LEVEL - 1];
        const actualResult = burstUtilities.getLevelEntryForBurst(mockBurst, EXISTING_LEVEL);
        expect(expectedResult).toBeDefined();
        expect(actualResult).toBe(expectedResult)
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

      it('returns the last level entry if no level entry is specified', () => {
        const expectedResult = mockBurst.levels[NUM_BURST_LEVELS - 1];
        const actualResult = burstUtilities.getLevelEntryForBurst(mockBurst);
        expect(actualResult).toBe(expectedResult);
      });
    });
  });
});
