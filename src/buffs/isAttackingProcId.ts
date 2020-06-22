import getMetadataForProc from './getMetadataForProc';
import { ProcBuffType } from '../buff-metadata';

/**
 * @description Determine if a given proc ID's type is an attack
 * @param id proc ID to check
 * @returns whether the given ID corresponds to a proc ID whose type is attack
 */
export default function isAttackingProcId (id: string): boolean {
	const metadataEntry = getMetadataForProc(id);
	return !!metadataEntry && metadataEntry.Type === ProcBuffType.Attack;
}
