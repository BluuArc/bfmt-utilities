import { ISpEnhancementEntry } from "../datamine-types";

/**
 * @description Get all SP Enhancement entries that require the given SP entry in order to be unlockable.
 * @param entry SP Entry to get dependents for.
 * @param allEntries Collection of SP Entries to search in.
 * @param addedEntries Entries that have already been added to the resulting collection; used to handle circular references.
 * @returns Collection of SP Enhancement entries (if any) that require the given SP entry in order to be unlockable.
 */
export default function getAllEntriesThatDependOnSpEntry (entry: ISpEnhancementEntry, allEntries: ISpEnhancementEntry[], addedEntries = new Set<ISpEnhancementEntry>()): ISpEnhancementEntry[] {
	let dependents: ISpEnhancementEntry[] = [];
	if (entry && entry.id && Array.isArray(allEntries) && allEntries.length > 0) {
		const entryId = entry.id;
		dependents = allEntries
			.filter(s => {
				return s.dependency &&
					s.dependency.includes(entryId) &&
					!addedEntries.has(s);
			});
		dependents.forEach(dependent => {
			addedEntries.add(dependent);
			const subDependents = getAllEntriesThatDependOnSpEntry(dependent, allEntries, addedEntries);
			dependents = dependents.concat(subDependents);
		});
	}
	return dependents;
}
