import { getEffectId, isAttackingProcId } from './buffs';
import { TARGET_AREA_MAPPING } from './constants';
import {
  BraveBurst,
  BurstDamageFramesEntry,
  BurstLevelEntry,
  DamageFramesEntry,
  ProcEffect,
  UnknownProcEffect,
} from './datamine-types';

/**
 * Given a brave burst and a level, get the associated entry at that burst's level
 * @param level the level of the entry to get; this is 1-indexed (so level 1 would get the entry at index 0)
 */
export function getLevelEntryForBurst (burst: BraveBurst, level?: number): BurstLevelEntry {
  const burstEffectsByLevel = (burst && Array.isArray(burst.levels)) ? burst.levels : [];
  let levelIndex: number;
  if (!isNaN(level as number)) {
    // 1-indexed
    levelIndex = (+(level as number) - 1);
  } else if (level === undefined) {
    // default to last entry in burst
    levelIndex = burstEffectsByLevel.length - 1;
  } else {
    levelIndex = level as number;
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
export function getBcDcInfo (burst: BraveBurst, level?: number): {
  /**
   * the BC cost of the burst at the given level
   */
  cost: number,

  /**
   * the number of hits of the burst at the given level
   */
  hits: number,

  /**
   * the maximum number of BC that can drop per enemy if every hit dropped its maximum amount of BC
   */
  dropchecks: number,
} {
  const result = {
    cost: 0,
    dropchecks: 0,
    hits: 0,
  };

  if (burst) {
    const levelEntry = getLevelEntryForBurst(burst, level);
    const attacks = ((Array.isArray(levelEntry.effects) && levelEntry.effects) || [])
      .map((e, i) => ({
        hits: (+(e.hits as number)) || (burst['damage frames'] && burst['damage frames'][i] || { hits: 0 }).hits || 0,
        id: e['proc id'] || (e as UnknownProcEffect)['unknown proc id'],
      })).filter((e) => isAttackingProcId(e.id));
    const numHits = attacks.reduce((acc, val) => acc + +val.hits, 0) || 0;
    const dropchecks = numHits * (+burst['drop check count'] || 0);

    result.cost = +levelEntry['bc cost'] || 0;
    result.hits = numHits;
    result.dropchecks = dropchecks;
  }
  return result;
}

/**
 * Combined object containing the damage frame and effect of an effect entry in a Brave Burst
 */
interface IEffectFrameData {
  /**
   * the damage frames for a given effect
   */
  damageFramesEntry: BurstDamageFramesEntry;

  /**
   * the time/frame delay of a given effect
   */
  delay: string;

  /**
   * the parameters for a given effect
   */
  effect: ProcEffect | UnknownProcEffect;

  /**
   * the proc id of a given effect
   */
  id: string;

  /**
   * the target area of a given effect
   */
  target: TARGET_AREA_MAPPING;
}

/**
 * Get a combined object containing the damage frames and effects of a given burst
 * @param filterFn determine what damage frames to return based on its ID; by default, it filters for attacking effects
 */
export function getEffectFrameData (burst: BraveBurst, filterFn: (input: IEffectFrameData) => boolean = (f) => isAttackingProcId(f.id)): IEffectFrameData[] {
  if (!burst || !Array.isArray(burst['damage frames'])) {
    return [];
  }
  // hit count data is the same regardless of level
  const endLevelEntry = getBurstEffects(burst);
  return burst['damage frames']
    .map((f, i) => {
      const effectData = endLevelEntry[i] || {};
      const targetArea = effectData['random attack']
        ? TARGET_AREA_MAPPING.random
        : (TARGET_AREA_MAPPING[effectData['target area'] as keyof (typeof TARGET_AREA_MAPPING)]); // tslint:disable-line no-any
      return {
        damageFramesEntry: f,
        delay: effectData['effect delay time(ms)/frame'],
        effect: effectData,
        id: getEffectId(f) || getEffectId(effectData),
        target: targetArea || effectData['target area'],
      };
    }).filter(filterFn);
}

/**
 * Get the frame data for all healing effects (i.e. with a proc ID of 2) from a given burst
 */
export function getHealFrameData (burst: BraveBurst) {
  return getEffectFrameData(burst, (f) => f.id === '2');
}

/**
 * Get the damage frames entry for extra attacks based on a given brave burst.
 */
export function getExtraAttackDamageFramesEntry (burst: BraveBurst): DamageFramesEntry {
  const unifiedFrames: Array<{
    /**
     * the damage of a particular attack at a given frame
     */
    dmg: number,

    /**
     * the frame of a particular attack
     */
    time: number,
  }> = [];
  // get frames that are either attacking or healing
  getEffectFrameData(burst, (f) => f.id === '2' || isAttackingProcId(f.id))
    .map((d) => d.damageFramesEntry)
    .forEach((frameSet, i) => {
      // aggregate frame data
      const keepFirstFrame = i === 0;
      // assumption: frame times array and hit damage distribution array are the same length
      const numFrames = frameSet['frame times'].length;
      for (let frameIndex = keepFirstFrame ? 0 : 1; frameIndex < numFrames; ++frameIndex) {
        unifiedFrames.push({
          dmg: frameSet['hit dmg% distribution'][frameIndex],
          time: frameSet['frame times'][frameIndex],
        });
      }
    });

  // sort frames by frame time and aggregate result
  const extraAttackDamageFramesEntry: DamageFramesEntry = {
    'effect delay time(ms)/frame': '0.0/0',
    'frame times': [],
    'hit dmg% distribution': [],
    'hit dmg% distribution total': 0,
  };
  return unifiedFrames.sort((a, b) => a.time - b.time).reduce(
    (acc, {time, dmg }) => {
      acc['frame times'].push(time);
      acc['hit dmg% distribution'].push(dmg);
      acc['hit dmg% distribution total'] += dmg;
      return acc;
    },
    extraAttackDamageFramesEntry,
  );
}
