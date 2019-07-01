import { isAttackingProcId } from './buffs';
import { BraveBurst, BurstLevelEntry, ProcEffect, UnknownProcEffect } from './datamine-types';

/**
 * Given a brave burst and a level, get the associated entry at that burst's level
 * @param level the level of the entry to get; this is 1-indexed (so level 1 would get the entry at index 0)
 */
export function getLevelEntryForBurst (burst: BraveBurst, level: number | undefined): BurstLevelEntry {
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
export function getBurstEffects (burst: BraveBurst, level: number | undefined): Array<ProcEffect | UnknownProcEffect> {
  const levelEntry = getLevelEntryForBurst(burst, level);
  return Array.isArray(levelEntry.effects) ? levelEntry.effects : [];
}

/**
 * Given a brave burst and a level, get the cost, hits, and dropcheck information for that burst's level
 * @param level the level of the entry to get; this is 1-indexed (so level 1 would get the entry at index 0)
 */
export function getBcDcInfo (burst: BraveBurst, level: number | undefined): { cost: number, hits: number, dropchecks: number} {
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
