[@bluuarc/bfmt-utilities - v0.6.0](../README.md) › [Globals](../globals.md) › ["buffs/isProcEffect"](_buffs_isproceffect_.md)

# Module: "buffs/isProcEffect"

## Index

### Functions

* [isProcEffect](_buffs_isproceffect_.md#isproceffect)

## Functions

###  isProcEffect

▸ **isProcEffect**(`effect`: object): *boolean*

*Defined in [buffs/isProcEffect.ts:7](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/isProcEffect.ts#L7)*

**`description`** Determine if a given effect object is a proc effect based on existing properties.
Do note that it does not check the validity of each property, only the existence.

**Parameters:**

▪ **effect**: *object*

object to check

Name | Type |
------ | ------ |
`proc id?` | undefined &#124; string |
`unknown proc id?` | undefined &#124; string |

**Returns:** *boolean*

whether the given effect object is considered a proc effect based on its properties
