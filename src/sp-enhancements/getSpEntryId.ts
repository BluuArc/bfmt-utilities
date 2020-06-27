/**
 * @description Extract the ID of a string in the format of `number@actualId`. If there
 * is no value after the @ character or if no @ character is present, the original ID is returned.
 * This is particularly useful for extracting the ID of [[ISpEnhancementEntry.dependency|`ISpEnhancementEntry.dependency`]].
 * @param id Original SP Enhancement Entry ID.
 * @returns The ID of a string in the format of `number@actualId`, or the original input if
 * there is no @ character or no value after the @ character.
 */
export default function getSpEntryId (id: string): string {
	return (typeof id === 'string' && id.split('@')[1]) || id;
}
