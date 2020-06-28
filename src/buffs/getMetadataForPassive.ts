import { IPassiveMetadataEntry, PASSIVE_METADATA } from './buff-metadata';

/**
 * @description Get the associated metadata entry for a given passive ID.
 * @param id Passive ID to get metadata for.
 * @param metadata Optional source to use as metadata; defaults to internal passive metadata.
 * @returns Corresponding passive metadata entry if it exists, undefined otherwise.
 */
export default function getMetadataForPassive (id: string, metadata = PASSIVE_METADATA): IPassiveMetadataEntry | undefined {
	return (!!metadata && typeof metadata === 'object') && Object.hasOwnProperty.call(metadata, id)
		? metadata[id]
		: (void 0);
}
