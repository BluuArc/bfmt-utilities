[@bluuarc/bfmt-utilities - v0.7.0](../README.md) › [Globals](../globals.md) › ["buffs/getMetadataForProc"](_buffs_getmetadataforproc_.md)

# Module: "buffs/getMetadataForProc"

## Index

### Functions

* [getMetadataForProc](_buffs_getmetadataforproc_.md#getmetadataforproc)

## Functions

###  getMetadataForProc

▸ **getMetadataForProc**(`id`: string, `metadata`: object): *[IProcMetadataEntry](../interfaces/_buffs_buff_metadata_.iprocmetadataentry.md) | undefined*

*Defined in [buffs/getMetadataForProc.ts:9](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/getMetadataForProc.ts#L9)*

**`description`** Get the associated metadata entry for a given proc ID.

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`id` | string | - | Proc ID to get metadata for. |
`metadata` | object | PROC_METADATA | Optional source to use as metadata; defaults to internal proc metadata. |

**Returns:** *[IProcMetadataEntry](../interfaces/_buffs_buff_metadata_.iprocmetadataentry.md) | undefined*

Corresponding proc metadata entry if it exists, undefined otherwise.
