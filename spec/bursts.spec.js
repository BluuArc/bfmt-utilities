import * as burstUtilities from '../src/bursts';
import { generateInputPairsOfTypesExcept } from './utils';
describe("bursts utilities", () => {
  const MOCK_PROC_EFFECT = { 'proc id': '1' };
  const MOCK_UNKNOWN_PROC_EFFECT = { 'unknown proc id': '48' };

  describe("getLevelEntryForBurst", () => {
    const DEFAULT_RETURN_VALUE = {
      'bc cost': 0,
      effects: [],
    };
    const assertShape = (input, cost = 0, effects = []) => {
      expect(typeof input).toBe('object');
      expect(input['bc cost']).toBe(cost);
      expect(input.effects).toEqual(effects);
    };

    describe("for non-object burst inputs", () => {
      generateInputPairsOfTypesExcept('object').forEach(testCase => {
        it(`returns expected shape when burst input is ${testCase.name}`, () => {
          const result = burstUtilities.getLevelEntryForBurst(testCase.value);
          assertShape(result, DEFAULT_RETURN_VALUE['bc cost'], DEFAULT_RETURN_VALUE.effects);
        });
      });
    });
  });
});
