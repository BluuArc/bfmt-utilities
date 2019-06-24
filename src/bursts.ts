import { isAttackingProcId } from './buffs';

export function getLevelEntryForBurst (burst: Bfmt.Utilities.Datamine.BraveBurst, level: number | undefined): Bfmt.Utilities.Datamine.BurstLevelEntry {
  const burstEffectsByLevel = (burst && Array.isArray(burst.levels)) ? burst.levels : [];
  const levelIndex = !isNaN(<number>level) ? +<number>level : (burstEffectsByLevel.length - 1);
  return burstEffectsByLevel[levelIndex] || { 'bc cost': 0, effects: [] };
}

export function getBurstEffects (burst: Bfmt.Utilities.Datamine.BraveBurst, level: number | undefined): Array<Bfmt.Utilities.Datamine.ProcEffect | Bfmt.Utilities.Datamine.UnknownProcEffect> {
  const levelEntry = getLevelEntryForBurst(burst, level);
  return levelEntry.effects;
}

export function getBcDcInfo (burst: Bfmt.Utilities.Datamine.BraveBurst, level: number | undefined): { cost: number, hits: number, dropchecks: number} {
  const result = {
    cost: 0,
    hits: 0,
    dropchecks: 0,
  };

  if (burst) {
    const levelEntry = getLevelEntryForBurst(burst, level);
    const attacks = levelEntry.effects
      .map((e, i) => ({
        id: e['proc id'] || (<Bfmt.Utilities.Datamine.UnknownProcEffect>e)['unknown proc id'],
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
