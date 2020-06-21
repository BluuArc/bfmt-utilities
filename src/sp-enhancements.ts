import {
	ISpEnhancementEntry,
	SpEnhancementEffect,
	PassiveEffect,
	SpPassiveType,
	SpCategoryName,
} from './datamine-types';

/**
 * @ignore
 */
const CHARACTER_CODE_FOR_UPPERCASE_A = 'A'.charCodeAt(0);
/**
 * @ignore
 */
const CHARACTER_CODE_FOR_LOWERCASE_A = 'a'.charCodeAt(0);
/**
 * @ignore
 */
const CHARACTER_CODE_FOR_NUMBER_0 = '0'.charCodeAt(0);

/**
 * @description Get the effects of a given SP Enhancement Entry
 * @param entry SP Enhancement Entry to get the effects of
 * @returns the effects of the given SP Enhancement Entry if they exist, an empty array otherwise
 */
export function getEffectsForSpEnhancement (entry: ISpEnhancementEntry): SpEnhancementEffect[] {
	const result: SpEnhancementEffect[] = [];
	if (entry && entry.skill && Array.isArray(entry.skill.effects)) {
		const effectWrappers = entry.skill.effects;
		effectWrappers.forEach(effectWrapper => {
			Object.keys(effectWrapper).forEach(spType => {
				const originalEffect = (effectWrapper[spType as SpPassiveType] as PassiveEffect);
				const unwrappedEffect: SpEnhancementEffect = {
					...originalEffect,
					sp_type: (spType as SpPassiveType),
				};
				result.push(unwrappedEffect);
			});
		});
	}
	return result;
}

/**
 * @description Get the associated category name with a given category ID.
 * @param categoryId Category ID to get the name of
 * @returns The name of the given category ID or the string 'Unknown'.
 */
export function getSpCategoryName (categoryId: string|number): SpCategoryName {
	let result: SpCategoryName;
	const numericalCategoryId = +categoryId;
	switch (numericalCategoryId) {
	case 1: result = SpCategoryName['Parameter Boost']; break;
	case 2: result = SpCategoryName.Spark; break;
	case 3: result = SpCategoryName['Critical Hits']; break;
	case 4: result = SpCategoryName['Attack Boost']; break;
	case 5: result = SpCategoryName['BB Gauge']; break;
	case 6: result = SpCategoryName['HP Recovery']; break;
	case 7: result = SpCategoryName.Drops; break;
	case 8: result = SpCategoryName['Ailment Resistance']; break;
	case 9: result = SpCategoryName['Ailment Infliction']; break;
	case 10: result = SpCategoryName['Damage Reduction']; break;
	case 11: result = SpCategoryName.Special; break;
	default: result = SpCategoryName.Unknown; break;
	}
	return result;
}

/**
 * @description Get the corresponding character code for a given index.
 * It expects an index between 0 and 61 inclusive; will return an empty string if
 * the given value is outside of the range.
 * @param index Index of an SP entry in a given skills array
 * @returns The corresponding single alphanumeric character to the given index
 * or an empty string if the index is invalid.
 */
export function spIndexToCode (index: number): string {
	let result = '';
	let correspondingCharacterCode = -1;
	if (Number.isInteger(index)) {
		if (index >= 0 && index <= 25) { // A-Z
			correspondingCharacterCode = index + CHARACTER_CODE_FOR_UPPERCASE_A;
		} else if (index >= 26 && index <= 51) { // a-z
			correspondingCharacterCode = (index - 26) + CHARACTER_CODE_FOR_LOWERCASE_A;
		} else if (index >= 52 && index <= 61) { // 0-9
			correspondingCharacterCode = (index - 52) + CHARACTER_CODE_FOR_NUMBER_0;
		}
	}

	if (correspondingCharacterCode !== -1) {
		result = String.fromCharCode(correspondingCharacterCode);
	}
	return result;
}

/**
 * @description Get the corresponding index for a given character code.
 * It expects an alphanumeric character and will return -1 otherwise.
 * @param code Character code an SP entry in a given skills array
 * @returns The corresponding index to the given character or -1 if the
 * character is invalid.
 */
export function spCodeToIndex (code: string): number {
	let result = -1;
	let characterCodeOffset = -1;
	if (!!code && typeof code === 'string' && code.length === 1) {
		if (code >= 'A' && code <= 'Z') {
			characterCodeOffset = CHARACTER_CODE_FOR_UPPERCASE_A;
		} else if (code >= 'a' && code <= 'z') {
			characterCodeOffset = CHARACTER_CODE_FOR_LOWERCASE_A - 26;
		} else if (code >= '0' && code <= '9') {
			characterCodeOffset = CHARACTER_CODE_FOR_NUMBER_0 - 52;
		}
	}

	if (characterCodeOffset !== -1) {
		result = code.charCodeAt(0) - characterCodeOffset;
	}
	return result;
}

/**
 * @description Extract the ID of a string in the format of `number@actualId`. If there
 * is no value after the @ character or if no @ character is present, the original ID is returned.
 * This is particularly useful for extracting the ID of [[ISpEnhancementEntry.dependency|`ISpEnhancementEntry.dependency`]]
 * @param id Original SP Enhancement Entry ID
 * @returns The ID of a string in the format of `number@actualId`, or the original input if
 * there is no @ character or no value after the @ character.
 */
export function getSpEntryId (id: string): string {
	return (typeof id === 'string' && id.split('@')[1]) || id;
}

/**
 * @description Get the first SP Enhancement Entry that matches the given SP Entry ID, if it exists.
 * @param id SP Enhancement entry ID
 * @param entries Collection of SP Enhancement entries to search in
 * @returns The corresponding SP Enhancement entry with the given SP ID, undefined otherwise.
 */
export function getSpEntryWithId (id: string, entries: ISpEnhancementEntry[]): ISpEnhancementEntry | undefined {
	const spId = getSpEntryId(id);
	return (id && Array.isArray(entries) && entries.find(e => getSpEntryId(e && e.id) === spId)) || void 0;
}

/**
 * @description Get all SP Enhancement entries that one would need to unlock the given SP entry.
 * @param entry SP Entry to get dependencies for.
 * @param allEntries Collection of SP Entries to search in.
 * @param addedEntries Entries that have already been added to the resulting collection; used to handle circular references.
 * @returns Collection of SP Enhancement entries (if any) that are required to unlock the given SP entry.
 */
export function getAllDependenciesForSpEntry (entry: ISpEnhancementEntry, allEntries: ISpEnhancementEntry[], addedEntries = new Set<ISpEnhancementEntry>()): ISpEnhancementEntry[] {
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

/**
 * @description Get all SP Enhancement entries that require the given SP entry in order to be unlockable.
 * @param entry SP Entry to get dependents for.
 * @param allEntries Collection of SP Entries to search in.
 * @param addedEntries Entries that have already been added to the resulting collection; used to handle circular references.
 * @returns Collection of SP Enhancement entries (if any) that require the given SP entry in order to be unlockable.
 */
export function getAllEntriesThatDependOnSpEntry (entry: ISpEnhancementEntry, allEntries: ISpEnhancementEntry[], addedEntries = new Set<ISpEnhancementEntry>()): ISpEnhancementEntry[] {
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
