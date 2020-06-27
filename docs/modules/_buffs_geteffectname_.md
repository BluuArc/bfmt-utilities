[@bluuarc/bfmt-utilities - v0.7.0](../README.md) › [Globals](../globals.md) › ["buffs/getEffectName"](_buffs_geteffectname_.md)

# Module: "buffs/getEffectName"

## Index

### Functions

* [getEffectName](_buffs_geteffectname_.md#geteffectname)

## Functions

###  getEffectName

▸ **getEffectName**(`effect`: object): *string*

*Defined in [buffs/getEffectName.ts:12](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/getEffectName.ts#L12)*

**`description`** Get the name of a given object.

**Parameters:**

▪ **effect**: *object*

Object to get the name from.

Name | Type |
------ | ------ |
`passive id?` | undefined &#124; string |
`proc id?` | undefined &#124; string |
`unknown passive id?` | undefined &#124; string |
`unknown proc id?` | undefined &#124; string |

**Returns:** *string*

Name of the input effect if it exists; empty string otherwise.
