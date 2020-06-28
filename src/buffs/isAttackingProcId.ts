import getMetadataForProc from './getMetadataForProc';
import { ProcBuffType, IProcMetadataEntry } from './buff-metadata';

/**
 * @description Determine if a given proc ID's type is an attack.
 * @param id Proc ID to check.
 * @param metadata Optional source to use as metadata; defaults to internal proc metadata.
 * @returns Whether the given ID corresponds to a proc ID whose type is attack.
 */
export default function isAttackingProcId (id: string, metadata?: { [id: string]: IProcMetadataEntry }): boolean {
	const metadataEntry = getMetadataForProc(id, metadata);
	return !!metadataEntry && metadataEntry.Type === ProcBuffType.Attack;
}
