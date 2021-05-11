[@bluuarc/bfmt-utilities - v0.8.0](../README.md) › [Globals](../globals.md) › ["buffs/parsers/buff-metadata"](../modules/_buffs_parsers_buff_metadata_.md) › [IBuffMetadata](_buffs_parsers_buff_metadata_.ibuffmetadata.md)

# Interface: IBuffMetadata

## Hierarchy

* **IBuffMetadata**

## Index

### Properties

* [icons](_buffs_parsers_buff_metadata_.ibuffmetadata.md#icons)
* [id](_buffs_parsers_buff_metadata_.ibuffmetadata.md#id)
* [name](_buffs_parsers_buff_metadata_.ibuffmetadata.md#name)
* [stackType](_buffs_parsers_buff_metadata_.ibuffmetadata.md#stacktype)
* [stat](_buffs_parsers_buff_metadata_.ibuffmetadata.md#optional-stat)

## Properties

###  icons

• **icons**: *function*

*Defined in [buffs/parsers/buff-metadata.ts:30](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-metadata.ts#L30)*

**`description`** Retrieves set of icons that represents this specific buff. Most buffs have a single icon, but
more can be specified if an effect affects multiple parts of a unit state. For example, the stealth effect affects both targeting
and self-stats but in-game it only shows a single icon; implementation in this library is such that there is a stealth entry
and separate stat entries that a given stealth effect may change, and those separate stat entries have two icons: the stealth
icon and the self-boost stat icon. On the contrary, the add elements effect can add multiple elements, but because it shows
up as individual buffs in-game, there is a separate buff entry for each added element.

#### Type declaration:

▸ (`buff`: [IBuff](_buffs_parsers_buff_types_.ibuff.md)): *[IconId](../enums/_buffs_parsers_buff_types_.iconid.md)[]*

**Parameters:**

Name | Type |
------ | ------ |
`buff` | [IBuff](_buffs_parsers_buff_types_.ibuff.md) |

___

###  id

• **id**: *[BuffId](../enums/_buffs_parsers_buff_types_.buffid.md)*

*Defined in [buffs/parsers/buff-metadata.ts:12](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-metadata.ts#L12)*

___

###  name

• **name**: *string*

*Defined in [buffs/parsers/buff-metadata.ts:13](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-metadata.ts#L13)*

___

###  stackType

• **stackType**: *[BuffStackType](../enums/_buffs_parsers_buff_types_.buffstacktype.md)*

*Defined in [buffs/parsers/buff-metadata.ts:20](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-metadata.ts#L20)*

___

### `Optional` stat

• **stat**? : *[UnitStat](../enums/_buffs_parsers_buff_types_.unitstat.md)*

*Defined in [buffs/parsers/buff-metadata.ts:18](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-metadata.ts#L18)*

**`description`** Unit stat that the given buff affects
