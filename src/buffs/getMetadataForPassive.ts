import { IPassiveMetadataEntry, PASSIVE_METADATA } from '../buff-metadata';

/**
 * @description Get the associated metadata entry for a given passive ID
 * @param id passive ID to get metadata for
 * @returns corresponding passive metadata entry if it exists, undefined otherwise
 */
export default function getMetadataForPassive (id: string): IPassiveMetadataEntry | undefined {
	return Object.hasOwnProperty.call(PASSIVE_METADATA, id)
		? PASSIVE_METADATA[id]
		: (void 0);
}