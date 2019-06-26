import { isAttackingProcId } from './buffs';
import { BraveBurst, BurstLevelEntry, ProcEffect, UnknownProcEffect } from './datamine-types';

/**
 * Given a brave burst and a level, get the associated entry at that burst's level
 */
export function getLevelEntryForBurst (burst: BraveBurst, level: number | undefined): BurstLevelEntry {
  const burstEffectsByLevel = (burst && Array.isArray(burst.levels)) ? burst.levels : [];
  const levelIndex = !isNaN(<number>level) ? +<number>level : (burstEffectsByLevel.length - 1);
  return burstEffectsByLevel[levelIndex] || { 'bc cost': 0, effects: [] };
}

/**
 * Given a brave burst and a level, get the list of effects at that burst's level
 */
export function getBurstEffects (burst: BraveBurst, level: number | undefined): Array<ProcEffect | UnknownProcEffect> {
  const levelEntry = getLevelEntryForBurst(burst, level);
  return levelEntry.effects;
}

/**
 * Given a brave burst and a level, get the cost, hits, and dropcheck information for that burst's level
 */
export function getBcDcInfo (burst: BraveBurst, level: number | undefined): { cost: number, hits: number, dropchecks: number} {
  const result = {
    cost: 0,
    hits: 0,
    dropchecks: 0,
  };

  if (burst) {
    const levelEntry = getLevelEntryForBurst(burst, level);
    const attacks = levelEntry.effects
      .map((e, i) => ({
        id: e['proc id'] || (<UnknownProcEffect>e)['unknown proc id'],
        hits: e.hits || (burst['damage frames'][i] || { hits: 0 }).hits || 0,
      })).filter(e => isAttackingProcId(e.id));
    const numHits = attacks.reduce((acc, val) => acc + +val.hits, 0);
    const dropchecks = numHits * +burst['drop check count'];

    result.cost = levelEntry['bc cost'];
    result.hits = numHits;
    result.dropchecks = dropchecks;
  }
  return result;
}
