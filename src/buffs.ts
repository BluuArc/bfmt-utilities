import { PROC_METADATA, ProcBuffType } from './buff-metadata';

/**
 * @description Determine if a given proc ID's type is an attack
 * @param id proc ID to check
 */
export function isAttackingProcId (id: string): boolean {
	const metadataEntry = PROC_METADATA.hasOwnProperty(id) && PROC_METADATA[id];
	return !!metadataEntry && metadataEntry.Type === ProcBuffType.Attack;
}
