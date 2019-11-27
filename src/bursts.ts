import {
	IBraveBurst,
	IBurstLevelEntry,
	ProcEffect,
	IDamageFramesEntry,
	IBurstDamageFramesEntry,
} from './datamine-types';
import { getEffectId, isAttackingProcId } from './buffs';
import { KnownProcId } from './constants';

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

export function getExtraAttackDamageFramesEntry (
	damageFrames: IBurstDamageFramesEntry[],
	effectDelay = '0.0/0',
): IDamageFramesEntry {
	// relevant frames are all effects for healing or attacking
	const relevantFrames = damageFrames.filter(frame => {
		const procId = getEffectId(frame);
		return procId === KnownProcId.BurstHeal || isAttackingProcId(procId);
	});

	type UnifiedFrame = { damage: number, time: number };
	const unifiedFrames: UnifiedFrame[] = relevantFrames.reduce((acc: UnifiedFrame[], frameEntry, index) => {
		const keepFirstFrame = index === 0;
		const numFrames = frameEntry['frame times'].length;
		const damageDistribution = frameEntry['hit dmg% distribution'];
		const frameTimes = frameEntry['frame times'];
		for (let frameIndex = keepFirstFrame ? 0 : 1; frameIndex < numFrames; ++frameIndex) {
			acc.push({
				damage: damageDistribution[frameIndex],
				time: frameTimes[frameIndex],
			});
		}
		return acc;
	}, []);

	const resultDamageFramesEntry: IDamageFramesEntry = {
		'effect delay time(ms)/frame': effectDelay,
		'frame times': [],
		'hit dmg% distribution': [],
		'hit dmg% distribution (total)': 0,
		hits: 0,
	};
	unifiedFrames.sort((a, b) => a.time - b.time)
		.forEach(({ time, damage }) => {
			resultDamageFramesEntry['frame times'].push(time);
			resultDamageFramesEntry['hit dmg% distribution'].push(damage);
			resultDamageFramesEntry['hit dmg% distribution (total)'] += damage;
		});
	resultDamageFramesEntry.hits = resultDamageFramesEntry['frame times'].length;
	return resultDamageFramesEntry;
}
