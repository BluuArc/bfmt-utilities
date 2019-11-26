import {
	IBraveBurst,
	IBurstLevelEntry,
	ProcEffect,
} from './datamine-types';

/**
 * @description Grab the level entry of a burst at a given level (or the last level if no level is given)
 * @param burst Burst to get level entry from
 * @param level Optional 1-indexed level to get; if not specified, the last level of the burst is used.
 */
export function getLevelEntryForBurst (burst: IBraveBurst, level?: number): IBurstLevelEntry | undefined {
	const burstEffectsByLevel = (burst && Array.isArray(burst.levels)) ? burst.levels : [];
	let levelIndex: number;
	if (level !== null && !isNaN(level as number)) {
		// 1-indexed
		levelIndex = (+(level as number) - 1);
	} else {
		// default to last entry in burst
		levelIndex = burstEffectsByLevel.length - 1;
	}
	return burstEffectsByLevel[levelIndex];
}

/**
 * @description Grab the effects at the level entry of a burst at a given level (or the last level if no level is given)
 * @param burst Burst to get effects from
 * @param level Optional 1-indexed level to get entries from; if not specified, the last level of the burst is used.
 */
export function getEffectsForBurst (burst: IBraveBurst, level?: number): ProcEffect[] {
	const levelEntry = getLevelEntryForBurst(burst, level);
	return (levelEntry && Array.isArray(levelEntry.effects)) ? levelEntry.effects : [];
}
