[@bluuarc/bfmt-utilities - v0.8.0](../README.md) › [Globals](../globals.md) › ["buffs/isAttackingProcId"](_buffs_isattackingprocid_.md)

# Module: "buffs/isAttackingProcId"

## Index

### Functions

* [isAttackingProcId](_buffs_isattackingprocid_.md#isattackingprocid)

## Functions

###  isAttackingProcId

▸ **isAttackingProcId**(`id`: string, `metadata?`: undefined | object): *boolean*

*Defined in [buffs/isAttackingProcId.ts:10](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/isAttackingProcId.ts#L10)*

**`description`** Determine if a given proc ID's type is an attack.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`id` | string | Proc ID to check. |
`metadata?` | undefined &#124; object | Optional source to use as metadata; defaults to internal proc metadata. |

**Returns:** *boolean*

Whether the given ID corresponds to a proc ID whose type is attack.
