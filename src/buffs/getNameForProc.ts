import getMetadataForProc from './getMetadataForProc';

/**
 * @description Get the associated name for a given proc ID.
 * @param id Proc ID to get the name of.
 * @returns Name of the proc ID if it exists, empty string otherwise.
 */
export default function getNameForProc (id: string): string {
	const metadataEntry = getMetadataForProc(id);
	return (!!metadataEntry && metadataEntry.Name) || '';
}
