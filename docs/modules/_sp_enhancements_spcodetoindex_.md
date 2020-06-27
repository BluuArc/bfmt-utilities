[@bluuarc/bfmt-utilities - v0.7.0](../README.md) › [Globals](../globals.md) › ["sp-enhancements/spCodeToIndex"](_sp_enhancements_spcodetoindex_.md)

# Module: "sp-enhancements/spCodeToIndex"

## Index

### Functions

* [spCodeToIndex](_sp_enhancements_spcodetoindex_.md#spcodetoindex)

## Functions

###  spCodeToIndex

▸ **spCodeToIndex**(`code`: string): *number*

*Defined in [sp-enhancements/spCodeToIndex.ts:14](https://github.com/BluuArc/bfmt-utilities/blob/master/src/sp-enhancements/spCodeToIndex.ts#L14)*

**`description`** Get the corresponding index for a given character code.
It expects an alphanumeric character and will return -1 otherwise.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`code` | string | Character code an SP entry in a given skills array. |

**Returns:** *number*

Corresponding index to the given character or -1 if the
character is invalid.
