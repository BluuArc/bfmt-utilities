> ## [bfmt-utilities](../README.md)

[Globals](../globals.md) / ["buffs"](_buffs_.md) /

# External module: "buffs"

### Index

#### Variables

* [attackingProcs](_buffs_.md#const-attackingprocs)

#### Functions

* [getEffectId](_buffs_.md#geteffectid)
* [isAttackingProcId](_buffs_.md#isattackingprocid)
* [isPassiveEffect](_buffs_.md#ispassiveeffect)
* [isProcEffect](_buffs_.md#isproceffect)

## Variables

### `Const` attackingProcs

● **attackingProcs**: *`ReadonlyArray<string>`* =  Object.freeze(['1', '13', '14', '27', '28', '29', '47', '61', '64', '75', '11000'].concat(['46', '48', '97']))

*Defined in [buffs.ts:12](https://github.com/BluuArc/bfmt-utilities/blob/1179835/src/buffs.ts#L12)*

List of proc IDs that are associated with attacks

___

## Functions

###  getEffectId

▸ **getEffectId**(`effect?`: undefined | object): *string*

*Defined in [buffs.ts:48](https://github.com/BluuArc/bfmt-utilities/blob/1179835/src/buffs.ts#L48)*

Get the ID of a given effect entry

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`effect?` | undefined \| object | the effect entry to read from  |

**Returns:** *string*

___

###  isAttackingProcId

▸ **isAttackingProcId**(`id`: string): *boolean*

*Defined in [buffs.ts:18](https://github.com/BluuArc/bfmt-utilities/blob/1179835/src/buffs.ts#L18)*

Determine if a given proc ID is associated with an attack

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`id` | string | Proc ID to test  |

**Returns:** *boolean*

___

###  isPassiveEffect

▸ **isPassiveEffect**(`effect`: any): *boolean*

*Defined in [buffs.ts:26](https://github.com/BluuArc/bfmt-utilities/blob/1179835/src/buffs.ts#L26)*

Determine whether a given effect entry is a passive effect

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`effect` | any |  {} | the effect entry to test  |

**Returns:** *boolean*

___

###  isProcEffect

▸ **isProcEffect**(`effect`: any): *boolean*

*Defined in [buffs.ts:37](https://github.com/BluuArc/bfmt-utilities/blob/1179835/src/buffs.ts#L37)*

Determine whether a given effect entry is a proc effect

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`effect` | any |  {} | the effect entry to test  |

**Returns:** *boolean*

___