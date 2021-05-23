[@bluuarc/bfmt-utilities - v0.8.0](../README.md) › [Globals](../globals.md) › ["buffs/getEffectName"](_buffs_geteffectname_.md)

# Module: "buffs/getEffectName"

## Index

### Functions

* [getEffectName](_buffs_geteffectname_.md#geteffectname)

## Functions

###  getEffectName

▸ **getEffectName**(`effect`: object, `metadata`: object): *string*

*Defined in [buffs/getEffectName.ts:14](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/getEffectName.ts#L14)*

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

▪`Default value`  **metadata**: *object*= {}

Optional sources of metadata for procs and passives; defaults to internal metadata for respective types.

Name | Type |
------ | ------ |
`passive?` | undefined &#124; object |
`proc?` | undefined &#124; object |

**Returns:** *string*

Name of the input effect if it exists; empty string otherwise.
