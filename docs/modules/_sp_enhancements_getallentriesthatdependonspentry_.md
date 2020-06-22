[@bluuarc/bfmt-utilities - v0.6.0](../README.md) › [Globals](../globals.md) › ["sp-enhancements/getAllEntriesThatDependOnSpEntry"](_sp_enhancements_getallentriesthatdependonspentry_.md)

# Module: "sp-enhancements/getAllEntriesThatDependOnSpEntry"

## Index

### Functions

* [getAllEntriesThatDependOnSpEntry](_sp_enhancements_getallentriesthatdependonspentry_.md#getallentriesthatdependonspentry)

## Functions

###  getAllEntriesThatDependOnSpEntry

▸ **getAllEntriesThatDependOnSpEntry**(`entry`: [ISpEnhancementEntry](../interfaces/_datamine_types_.ispenhancemententry.md), `allEntries`: [ISpEnhancementEntry](../interfaces/_datamine_types_.ispenhancemententry.md)[], `addedEntries`: Set‹[ISpEnhancementEntry](../interfaces/_datamine_types_.ispenhancemententry.md)›): *[ISpEnhancementEntry](../interfaces/_datamine_types_.ispenhancemententry.md)[]*

*Defined in [sp-enhancements/getAllEntriesThatDependOnSpEntry.ts:10](https://github.com/BluuArc/bfmt-utilities/blob/master/src/sp-enhancements/getAllEntriesThatDependOnSpEntry.ts#L10)*

**`description`** Get all SP Enhancement entries that require the given SP entry in order to be unlockable.

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`entry` | [ISpEnhancementEntry](../interfaces/_datamine_types_.ispenhancemententry.md) | - | SP Entry to get dependents for. |
`allEntries` | [ISpEnhancementEntry](../interfaces/_datamine_types_.ispenhancemententry.md)[] | - | Collection of SP Entries to search in. |
`addedEntries` | Set‹[ISpEnhancementEntry](../interfaces/_datamine_types_.ispenhancemententry.md)› | new Set<ISpEnhancementEntry>() | Entries that have already been added to the resulting collection; used to handle circular references. |

**Returns:** *[ISpEnhancementEntry](../interfaces/_datamine_types_.ispenhancemententry.md)[]*

Collection of SP Enhancement entries (if any) that require the given SP entry in order to be unlockable.
