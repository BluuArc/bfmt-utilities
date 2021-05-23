[@bluuarc/bfmt-utilities - v0.8.0](../README.md) › [Globals](../globals.md) › ["buffs/isPassiveEffect"](_buffs_ispassiveeffect_.md)

# Module: "buffs/isPassiveEffect"

## Index

### Functions

* [isPassiveEffect](_buffs_ispassiveeffect_.md#ispassiveeffect)

## Functions

###  isPassiveEffect

▸ **isPassiveEffect**(`effect`: object): *boolean*

*Defined in [buffs/isPassiveEffect.ts:7](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/isPassiveEffect.ts#L7)*

**`description`** Determine if a given effect object is a passive effect based on existing properties.
Do note that it does not check the validity of each property, only the existence.

**Parameters:**

▪ **effect**: *object*

Object to check.

Name | Type |
------ | ------ |
`passive id?` | undefined &#124; string |
`unknown passive id?` | undefined &#124; string |

**Returns:** *boolean*

Whether the given effect object is considered a passive effect based on its properties.
