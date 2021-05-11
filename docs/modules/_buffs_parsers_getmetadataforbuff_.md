[@bluuarc/bfmt-utilities - v0.8.0](../README.md) › [Globals](../globals.md) › ["buffs/parsers/getMetadataForBuff"](_buffs_parsers_getmetadataforbuff_.md)

# Module: "buffs/parsers/getMetadataForBuff"

## Index

### Functions

* [getMetadataForBuff](_buffs_parsers_getmetadataforbuff_.md#getmetadataforbuff)

## Functions

###  getMetadataForBuff

▸ **getMetadataForBuff**(`id`: [BuffId](../enums/_buffs_parsers_buff_types_.buffid.md), `metadata`: object): *[IBuffMetadata](../interfaces/_buffs_parsers_buff_metadata_.ibuffmetadata.md) | undefined*

*Defined in [buffs/parsers/getMetadataForBuff.ts:10](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/getMetadataForBuff.ts#L10)*

**`description`** Get the associated metadata entry for a given buff ID.

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`id` | [BuffId](../enums/_buffs_parsers_buff_types_.buffid.md) | - | Buff ID to get metadata for. |
`metadata` | object | BUFF_METADATA | Optional source to use as metadata; defaults to internal buff metadata. |

**Returns:** *[IBuffMetadata](../interfaces/_buffs_parsers_buff_metadata_.ibuffmetadata.md) | undefined*

Corresponding buff metadata entry if it exists, undefined otherwise.
