import { IBraveBurst, IBurstLevelEntry } from './datamine-types';

/**
 * @description Grab the effects of a burst at a given level (or the last level if no level is given)
 * @param burst Burst to get effects from
 * @param level Optional level of the effects to get; if not specified, the effects at the last level of the burst is used.
 */
export function getLevelEntryForBurst (burst: IBraveBurst, level?: number): IBurstLevelEntry | undefined {
	const burstEffectsByLevel = (burst && Array.isArray(burst.levels)) ? burst.levels : [];
	let levelIndex: number;
	if (!isNaN(level as number)) {
		// 1-indexed
		levelIndex = (+(level as number) - 1);
	} else {
		// default to last entry in burst
		levelIndex = burstEffectsByLevel.length - 1;
	}
	return burstEffectsByLevel[levelIndex];
}
