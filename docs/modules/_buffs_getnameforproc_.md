[@bluuarc/bfmt-utilities - v0.7.0](../README.md) › [Globals](../globals.md) › ["buffs/getNameForProc"](_buffs_getnameforproc_.md)

# Module: "buffs/getNameForProc"

## Index

### Functions

* [getNameForProc](_buffs_getnameforproc_.md#getnameforproc)

## Functions

###  getNameForProc

▸ **getNameForProc**(`id`: string, `metadata?`: undefined | object): *string*

*Defined in [buffs/getNameForProc.ts:10](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/getNameForProc.ts#L10)*

**`description`** Get the associated name for a given proc ID.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`id` | string | Proc ID to get the name of. |
`metadata?` | undefined &#124; object | Optional source to use as metadata; defaults to internal proc metadata. |

**Returns:** *string*

Name of the proc ID if it exists, empty string otherwise.
