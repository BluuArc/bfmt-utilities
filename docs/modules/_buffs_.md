> ## [bfmt-utilities](../README.md)

[Globals](../globals.md) / ["buffs"](_buffs_.md) /

# External module: "buffs"

### Index

#### Variables

* [attackingProcs](_buffs_.md#const-attackingprocs)

#### Functions

* [isAttackingProcId](_buffs_.md#isattackingprocid)

## Variables

### `Const` attackingProcs

● **attackingProcs**: *`ReadonlyArray<string>`* =  Object.freeze(['1', '13', '14', '27', '28', '29', '47', '61', '64', '75', '11000'].concat(['46', '48', '97']))

*Defined in [buffs.ts:5](https://github.com/BluuArc/bfmt-utilities/blob/dfb9803/src/buffs.ts#L5)*

**`type`** {string[]} List of proc IDs that are associated with attacks

___

## Functions

###  isAttackingProcId

▸ **isAttackingProcId**(`id`: string): *boolean*

*Defined in [buffs.ts:11](https://github.com/BluuArc/bfmt-utilities/blob/dfb9803/src/buffs.ts#L11)*

Determine if a given proc ID is associated with an attack

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`id` | string | Proc ID to test  |

**Returns:** *boolean*

___