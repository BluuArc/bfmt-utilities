import getMetadataForPassive from './getMetadataForPassive';

/**
 * @description Get the associated name for a given passive ID
 * @param id passive ID to get the name of
 * @returns the name of the passive ID if it exists, empty string otherwise
 */
export default function getNameForPassive (id: string): string {
	const metadataEntry = getMetadataForPassive(id);
	return (!!metadataEntry && metadataEntry.Name) || '';
}
