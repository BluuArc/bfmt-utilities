import { IProcMetadataEntry, PROC_METADATA } from '../buff-metadata';

/**
 * @description Get the associated metadata entry for a given proc ID
 * @param id proc ID to get metadata for
 * @returns corresponding proc metadata entry if it exists, undefined otherwise
 */
export default function getMetadataForProc (id: string): IProcMetadataEntry | undefined {
	return Object.hasOwnProperty.call(PROC_METADATA, id)
		? PROC_METADATA[id]
		: (void 0);
}
