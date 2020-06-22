import { IBraveBurst, ProcEffect } from '../datamine-types';
import getLevelEntryForBurst from './getLevelEntryForBurst';

/**
 * @description Grab the effects at the level entry of a burst at a given level (or the last level if no level is given)
 * @param burst Burst to get effects from
 * @param level Optional 1-indexed level to get entries from; if not specified, the last level of the burst is used.
 * @returns the effects at the level entry of a burst at a given level (or last level if no level is given) if it exists, an empty array otherwise
 */
export default function getEffectsForBurst (burst: IBraveBurst, level?: number): ProcEffect[] {
	const levelEntry = getLevelEntryForBurst(burst, level);
	return (levelEntry && Array.isArray(levelEntry.effects)) ? levelEntry.effects : [];
}
