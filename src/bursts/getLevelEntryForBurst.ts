import { IBraveBurst, IBurstLevelEntry } from '../datamine-types';

/**
 * @description Get the level entry of a burst at a given level (or the last level if no level is given).
 * @param burst Burst to get level entry from.
 * @param level Optional 1-indexed level to get; if not specified, the last level of the burst is used.
 * @returns Level entry of a burst at a given level (or last level if no level is given) if it exists, undefined otherwise.
 */
export default function getLevelEntryForBurst (burst: IBraveBurst, level?: number): IBurstLevelEntry | undefined {
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
