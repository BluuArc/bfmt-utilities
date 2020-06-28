import { IProcMetadataEntry, PROC_METADATA } from './buff-metadata';

/**
 * @description Get the associated metadata entry for a given proc ID.
 * @param id Proc ID to get metadata for.
 * @param metadata Optional source to use as metadata; defaults to internal proc metadata.
 * @returns Corresponding proc metadata entry if it exists, undefined otherwise.
 */
export default function getMetadataForProc (id: string, metadata: { [id: string]: IProcMetadataEntry } = PROC_METADATA): IProcMetadataEntry | undefined {
	return (!!metadata && typeof metadata === 'object') && Object.hasOwnProperty.call(metadata, id)
		? metadata[id]
		: (void 0);
}
