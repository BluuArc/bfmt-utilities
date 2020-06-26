import { ISpEnhancementEntry } from '../datamine-types';
import getSpEntryId from './getSpEntryId';

/**
 * @description Get the first SP Enhancement Entry that matches the given SP Entry ID, if it exists.
 * @param id SP Enhancement entry ID.
 * @param entries Collection of SP Enhancement entries to search in.
 * @returns Corresponding SP Enhancement entry with the given SP ID, undefined otherwise.
 */
export default function getSpEntryWithId (id: string, entries: ISpEnhancementEntry[]): ISpEnhancementEntry | undefined {
	const spId = getSpEntryId(id);
	return (id && Array.isArray(entries) && entries.find(e => getSpEntryId(e && e.id) === spId)) || void 0;
}
