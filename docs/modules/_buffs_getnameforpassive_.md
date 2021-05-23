[@bluuarc/bfmt-utilities - v0.8.0](../README.md) › [Globals](../globals.md) › ["buffs/getNameForPassive"](_buffs_getnameforpassive_.md)

# Module: "buffs/getNameForPassive"

## Index

### Functions

* [getNameForPassive](_buffs_getnameforpassive_.md#getnameforpassive)

## Functions

###  getNameForPassive

▸ **getNameForPassive**(`id`: string, `metadata?`: undefined | object): *string*

*Defined in [buffs/getNameForPassive.ts:10](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/getNameForPassive.ts#L10)*

**`description`** Get the associated name for a given passive ID.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`id` | string | Passive ID to get the name of. |
`metadata?` | undefined &#124; object | Optional source to use as metadata; defaults to internal passive metadata. |

**Returns:** *string*

Name of the passive ID if it exists, empty string otherwise.
