[@bluuarc/bfmt-utilities - v0.6.0](../README.md) › [Globals](../globals.md) › ["sp-enhancements/spIndexToCode"](_sp_enhancements_spindextocode_.md)

# Module: "sp-enhancements/spIndexToCode"

## Index

### Functions

* [spIndexToCode](_sp_enhancements_spindextocode_.md#spindextocode)

## Functions

###  spIndexToCode

▸ **spIndexToCode**(`index`: number): *string*

*Defined in [sp-enhancements/spIndexToCode.ts:15](https://github.com/BluuArc/bfmt-utilities/blob/master/src/sp-enhancements/spIndexToCode.ts#L15)*

**`description`** Get the corresponding character code for a given index.
It expects an index between 0 and 61 inclusive; will return an empty string if
the given value is outside of the range.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`index` | number | Index of an SP entry in a given skills array. |

**Returns:** *string*

Corresponding single alphanumeric character to the given index
or an empty string if the index is invalid.
