import getMetadataForPassive from './getMetadataForPassive';
import { IPassiveMetadataEntry } from './buff-metadata';

/**
 * @description Get the associated name for a given passive ID.
 * @param id Passive ID to get the name of.
 * @param metadata Optional source to use as metadata; defaults to internal passive metadata.
 * @returns Name of the passive ID if it exists, empty string otherwise.
 */
export default function getNameForPassive (id: string, metadata?: { [id: string]: IPassiveMetadataEntry }): string {
	const metadataEntry = getMetadataForPassive(id, metadata);
	return (!!metadataEntry && metadataEntry.Name) || '';
}
