[@bluuarc/bfmt-utilities - v0.7.0](../README.md) › [Globals](../globals.md) › ["sp-enhancements/getAllDependenciesForSpEntry"](_sp_enhancements_getalldependenciesforspentry_.md)

# Module: "sp-enhancements/getAllDependenciesForSpEntry"

## Index

### Functions

* [getAllDependenciesForSpEntry](_sp_enhancements_getalldependenciesforspentry_.md#getalldependenciesforspentry)

## Functions

###  getAllDependenciesForSpEntry

▸ **getAllDependenciesForSpEntry**(`entry`: [ISpEnhancementEntry](../interfaces/_datamine_types_.ispenhancemententry.md), `allEntries`: [ISpEnhancementEntry](../interfaces/_datamine_types_.ispenhancemententry.md)[], `addedEntries`: Set‹[ISpEnhancementEntry](../interfaces/_datamine_types_.ispenhancemententry.md)›): *[ISpEnhancementEntry](../interfaces/_datamine_types_.ispenhancemententry.md)[]*

*Defined in [sp-enhancements/getAllDependenciesForSpEntry.ts:11](https://github.com/BluuArc/bfmt-utilities/blob/master/src/sp-enhancements/getAllDependenciesForSpEntry.ts#L11)*

**`description`** Get all SP Enhancement entries that one would need to unlock the given SP entry.

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`entry` | [ISpEnhancementEntry](../interfaces/_datamine_types_.ispenhancemententry.md) | - | SP Entry to get dependencies for. |
`allEntries` | [ISpEnhancementEntry](../interfaces/_datamine_types_.ispenhancemententry.md)[] | - | Collection of SP Entries to search in. |
`addedEntries` | Set‹[ISpEnhancementEntry](../interfaces/_datamine_types_.ispenhancemententry.md)› | new Set<ISpEnhancementEntry>() | Entries that have already been added to the resulting collection; used to handle circular references. |

**Returns:** *[ISpEnhancementEntry](../interfaces/_datamine_types_.ispenhancemententry.md)[]*

Collection of SP Enhancement entries (if any) that are required to unlock the given SP entry.
