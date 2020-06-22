[@bluuarc/bfmt-utilities - v0.6.0](../README.md) › [Globals](../globals.md) › ["buffs/getEffectId"](_buffs_geteffectid_.md)

# Module: "buffs/getEffectId"

## Index

### Functions

* [getEffectId](_buffs_geteffectid_.md#geteffectid)

## Functions

###  getEffectId

▸ **getEffectId**(`effect`: object): *string*

*Defined in [buffs/getEffectId.ts:6](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/getEffectId.ts#L6)*

**`description`** Get the proc/passive ID of a given object

**Parameters:**

▪ **effect**: *object*

Object to get the effect ID from

Name | Type |
------ | ------ |
`passive id?` | undefined &#124; string |
`proc id?` | undefined &#124; string |
`unknown passive id?` | undefined &#124; string |
`unknown proc id?` | undefined &#124; string |

**Returns:** *string*

The proc/passive ID of the input effect if it exists; empty string otherwise
