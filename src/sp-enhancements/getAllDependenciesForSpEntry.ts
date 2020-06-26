import { ISpEnhancementEntry } from '../datamine-types';
import getSpEntryId from './getSpEntryId';

/**
 * @description Get all SP Enhancement entries that one would need to unlock the given SP entry.
 * @param entry SP Entry to get dependencies for.
 * @param allEntries Collection of SP Entries to search in.
 * @param addedEntries Entries that have already been added to the resulting collection; used to handle circular references.
 * @returns Collection of SP Enhancement entries (if any) that are required to unlock the given SP entry.
 */
export default function getAllDependenciesForSpEntry (entry: ISpEnhancementEntry, allEntries: ISpEnhancementEntry[], addedEntries = new Set<ISpEnhancementEntry>()): ISpEnhancementEntry[] {
	let dependencies: ISpEnhancementEntry[] = [];
	if (entry && entry.dependency && Array.isArray(allEntries) && allEntries.length > 0) {
		const dependencyId = getSpEntryId(entry.dependency);
		const dependencyEntry = allEntries.find(s => getSpEntryId(s && s.id) === dependencyId);
		if (dependencyEntry && !addedEntries.has(dependencyEntry)) {
			addedEntries.add(dependencyEntry);
			const subDependencies = getAllDependenciesForSpEntry(dependencyEntry, allEntries, addedEntries);
			dependencies = [dependencyEntry].concat(subDependencies);
		}
	}
	return dependencies;
}
