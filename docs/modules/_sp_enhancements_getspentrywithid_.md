[@bluuarc/bfmt-utilities - v0.7.0](../README.md) › [Globals](../globals.md) › ["sp-enhancements/getSpEntryWithId"](_sp_enhancements_getspentrywithid_.md)

# Module: "sp-enhancements/getSpEntryWithId"

## Index

### Functions

* [getSpEntryWithId](_sp_enhancements_getspentrywithid_.md#getspentrywithid)

## Functions

###  getSpEntryWithId

▸ **getSpEntryWithId**(`id`: string, `entries`: [ISpEnhancementEntry](../interfaces/_datamine_types_.ispenhancemententry.md)[]): *[ISpEnhancementEntry](../interfaces/_datamine_types_.ispenhancemententry.md) | undefined*

*Defined in [sp-enhancements/getSpEntryWithId.ts:10](https://github.com/BluuArc/bfmt-utilities/blob/master/src/sp-enhancements/getSpEntryWithId.ts#L10)*

**`description`** Get the first SP Enhancement Entry that matches the given SP Entry ID, if it exists.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`id` | string | SP Enhancement entry ID. |
`entries` | [ISpEnhancementEntry](../interfaces/_datamine_types_.ispenhancemententry.md)[] | Collection of SP Enhancement entries to search in. |

**Returns:** *[ISpEnhancementEntry](../interfaces/_datamine_types_.ispenhancemententry.md) | undefined*

Corresponding SP Enhancement entry with the given SP ID, undefined otherwise.
