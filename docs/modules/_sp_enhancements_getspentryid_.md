[@bluuarc/bfmt-utilities - v0.6.0](../README.md) › [Globals](../globals.md) › ["sp-enhancements/getSpEntryId"](_sp_enhancements_getspentryid_.md)

# Module: "sp-enhancements/getSpEntryId"

## Index

### Functions

* [getSpEntryId](_sp_enhancements_getspentryid_.md#getspentryid)

## Functions

###  getSpEntryId

▸ **getSpEntryId**(`id`: string): *string*

*Defined in [sp-enhancements/getSpEntryId.ts:9](https://github.com/BluuArc/bfmt-utilities/blob/master/src/sp-enhancements/getSpEntryId.ts#L9)*

**`description`** Extract the ID of a string in the format of `number@actualId`. If there
is no value after the @ character or if no @ character is present, the original ID is returned.
This is particularly useful for extracting the ID of [`ISpEnhancementEntry.dependency`](../interfaces/_datamine_types_.ispenhancemententry.md#optional-dependency).

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`id` | string | Original SP Enhancement Entry ID. |

**Returns:** *string*

The ID of a string in the format of `number@actualId`, or the original input if
there is no @ character or no value after the @ character.
