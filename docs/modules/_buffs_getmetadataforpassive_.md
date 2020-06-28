[@bluuarc/bfmt-utilities - v0.7.0](../README.md) › [Globals](../globals.md) › ["buffs/getMetadataForPassive"](_buffs_getmetadataforpassive_.md)

# Module: "buffs/getMetadataForPassive"

## Index

### Functions

* [getMetadataForPassive](_buffs_getmetadataforpassive_.md#getmetadataforpassive)

## Functions

###  getMetadataForPassive

▸ **getMetadataForPassive**(`id`: string, `metadata`: object): *[IPassiveMetadataEntry](../interfaces/_buffs_buff_metadata_.ipassivemetadataentry.md) | undefined*

*Defined in [buffs/getMetadataForPassive.ts:9](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/getMetadataForPassive.ts#L9)*

**`description`** Get the associated metadata entry for a given passive ID.

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`id` | string | - | Passive ID to get metadata for. |
`metadata` | object | PASSIVE_METADATA | Optional source to use as metadata; defaults to internal passive metadata. |

**Returns:** *[IPassiveMetadataEntry](../interfaces/_buffs_buff_metadata_.ipassivemetadataentry.md) | undefined*

Corresponding passive metadata entry if it exists, undefined otherwise.
