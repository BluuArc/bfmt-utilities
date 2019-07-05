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

*Defined in [buffs.ts:12](https://github.com/BluuArc/bfmt-utilities/blob/2fa5d16/src/buffs.ts#L12)*

**`type`** {string[]} List of proc IDs that are associated with attacks

___

## Functions

###  getEffectId

▸ **getEffectId**(`effect?`: undefined | object): *string*

*Defined in [buffs.ts:38](https://github.com/BluuArc/bfmt-utilities/blob/2fa5d16/src/buffs.ts#L38)*

**Parameters:**

Name | Type |
------ | ------ |
`effect?` | undefined \| object |

**Returns:** *string*

___

###  isAttackingProcId

▸ **isAttackingProcId**(`id`: string): *boolean*

*Defined in [buffs.ts:18](https://github.com/BluuArc/bfmt-utilities/blob/2fa5d16/src/buffs.ts#L18)*

Determine if a given proc ID is associated with an attack

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`id` | string | Proc ID to test  |

**Returns:** *boolean*

___

###  isPassiveEffect

▸ **isPassiveEffect**(`effect`: any): *boolean*

*Defined in [buffs.ts:23](https://github.com/BluuArc/bfmt-utilities/blob/2fa5d16/src/buffs.ts#L23)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`effect` | any |  {} |

**Returns:** *boolean*

___

###  isProcEffect

▸ **isProcEffect**(`effect`: any): *boolean*

*Defined in [buffs.ts:31](https://github.com/BluuArc/bfmt-utilities/blob/2fa5d16/src/buffs.ts#L31)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`effect` | any |  {} |

**Returns:** *boolean*

___