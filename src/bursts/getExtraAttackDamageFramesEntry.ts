import { IBurstDamageFramesEntry } from '../datamine-types';
import getEffectId from '../buffs/getEffectId';
import { KNOWN_PROC_ID } from '../buffs/constants';
import isAttackingProcId from '../buffs/isAttackingProcId';
import { IProcMetadataEntry } from '../buffs/buff-metadata';

/**
 * @description Get the extra attack damage frames entry based on the damage frames of a burst. Also apply the given effect delay to the resulting damage frames entry.
 * @param damageFrames Damage frames that each have their own proc ID.
 * @param effectDelay Optional effect delay to apply to the resulting damage frames entry.
 * @param metadata Optional source to use as metadata; defaults to internal proc metadata.
 * @returns Damage frames entry whose frames are based on the input damage frames.
 */
export default function getExtraAttackDamageFramesEntry (
	damageFrames: IBurstDamageFramesEntry[],
	effectDelay = '0.0/0',
	metadata?: { [id: string]: IProcMetadataEntry },
): IBurstDamageFramesEntry {
	// relevant frames are all effects for healing or attacking
	const inputFrames = Array.isArray(damageFrames) ? damageFrames : [];
	const relevantFrames = inputFrames.filter(frame => {
		const procId = getEffectId(frame);
		return procId === KNOWN_PROC_ID.BurstHeal || isAttackingProcId(procId, metadata);
	});

	type UnifiedFrame = {
		damage: number;
		time: number;
	};
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

	const resultDamageFramesEntry: IBurstDamageFramesEntry = {
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
