import { isAttackingProcId, getEffectId } from './buffs';
import { BraveBurst, BurstLevelEntry, ProcEffect, UnknownProcEffect } from './datamine-types';
import { TARGET_AREA_MAPPING } from './constants';

/**
 * Given a brave burst and a level, get the associated entry at that burst's level
 * @param level the level of the entry to get; this is 1-indexed (so level 1 would get the entry at index 0)
 */
export function getLevelEntryForBurst (burst: BraveBurst, level?: number): BurstLevelEntry {
  const burstEffectsByLevel = (burst && Array.isArray(burst.levels)) ? burst.levels : [];
  let levelIndex: number;
  if (!isNaN(<number>level)) {
    // 1-indexed
    levelIndex = (+<number>level - 1);
  } else if (level === undefined) {
    // default to last entry in burst
    levelIndex = burstEffectsByLevel.length - 1;
  } else {
    levelIndex = <number>level;
  }
  return burstEffectsByLevel[levelIndex] || { 'bc cost': 0, effects: [] };
}

/**
 * Given a brave burst and a level, get the list of effects at that burst's level
 * @param level the level of the entry to get; this is 1-indexed (so level 1 would get the entry at index 0)
 */
export function getBurstEffects (burst: BraveBurst, level?: number): Array<ProcEffect | UnknownProcEffect> {
  const levelEntry = getLevelEntryForBurst(burst, level);
  return Array.isArray(levelEntry.effects) ? levelEntry.effects : [];
}

/**
 * Given a brave burst and a level, get the cost, hits, and dropcheck information for that burst's level
 * @param level the level of the entry to get; this is 1-indexed (so level 1 would get the entry at index 0)
 */
export function getBcDcInfo (burst: BraveBurst, level?: number): { cost: number, hits: number, dropchecks: number} {
  const result = {
    cost: 0,
    hits: 0,
    dropchecks: 0,
  };

  if (burst) {
    const levelEntry = getLevelEntryForBurst(burst, level);
    const attacks = ((Array.isArray(levelEntry.effects) && levelEntry.effects) || [])
      .map((e, i) => ({
        id: e['proc id'] || (<UnknownProcEffect>e)['unknown proc id'],
        hits: (+<number>e.hits) || (burst['damage frames'] && burst['damage frames'][i] || { hits: 0 }).hits || 0,
      })).filter(e => isAttackingProcId(e.id));
    const numHits = attacks.reduce((acc, val) => acc + +val.hits, 0) || 0;
    const dropchecks = numHits * (+burst['drop check count'] || 0);

    result.cost = +levelEntry['bc cost'] || 0;
    result.hits = numHits;
    result.dropchecks = dropchecks;
  }
  return result;
}

export function getHitCountData (burst: BraveBurst, filterFn: (input: any) => boolean = (f) => isAttackingProcId(f.id)) {
  if (typeof burst !== 'object' || !Array.isArray(burst['damage frames'])) {
    return [];
  }
  // hit count data is the same regardless of level
  const endLevelEntry = getBurstEffects(burst);
  return burst['damage frames']
    .map((f, i) => {
      const effectData = endLevelEntry[i];
      const targetArea = effectData['random attack'] ? TARGET_AREA_MAPPING.random : (<TARGET_AREA_MAPPING>effectData['target area']);
      return {
        target: targetArea,
        id: getEffectId(f),
        damageFramesEntry: f,
        delay: effectData['effect delay time(ms)/frame'],
        effects: effectData,
      };
    }).filter(filterFn);
}
