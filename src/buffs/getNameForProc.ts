import getMetadataForProc from './getMetadataForProc';
import { IProcMetadataEntry } from './effect-metadata';

/**
 * @description Get the associated name for a given proc ID.
 * @param id Proc ID to get the name of.
 * @param metadata Optional source to use as metadata; defaults to internal proc metadata.
 * @returns Name of the proc ID if it exists, empty string otherwise.
 */
export default function getNameForProc (id: string, metadata?: { [id: string]: IProcMetadataEntry }): string {
	const metadataEntry = getMetadataForProc(id, metadata);
	return (!!metadataEntry && metadataEntry.Name) || '';
}
