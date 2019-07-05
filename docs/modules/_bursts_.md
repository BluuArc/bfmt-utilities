> ## [bfmt-utilities](../README.md)

[Globals](../globals.md) / ["bursts"](_bursts_.md) /

# External module: "bursts"

### Index

#### Functions

* [getBcDcInfo](_bursts_.md#getbcdcinfo)
* [getBurstEffects](_bursts_.md#getbursteffects)
* [getHitCountData](_bursts_.md#gethitcountdata)
* [getLevelEntryForBurst](_bursts_.md#getlevelentryforburst)

## Functions

###  getBcDcInfo

▸ **getBcDcInfo**(`burst`: [BraveBurst](_datamine_types_d_.md#braveburst), `level?`: undefined | number): *object*

*Defined in [bursts.ts:37](https://github.com/BluuArc/bfmt-utilities/blob/2fa5d16/src/bursts.ts#L37)*

Given a brave burst and a level, get the cost, hits, and dropcheck information for that burst's level

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`burst` | [BraveBurst](_datamine_types_d_.md#braveburst) | - |
`level?` | undefined \| number | the level of the entry to get; this is 1-indexed (so level 1 would get the entry at index 0)  |

**Returns:** *object*

* **cost**: *number*

* **dropchecks**: *number*

* **hits**: *number*

___

###  getBurstEffects

▸ **getBurstEffects**(`burst`: [BraveBurst](_datamine_types_d_.md#braveburst), `level?`: undefined | number): *`Array<ProcEffect | UnknownProcEffect>`*

*Defined in [bursts.ts:28](https://github.com/BluuArc/bfmt-utilities/blob/2fa5d16/src/bursts.ts#L28)*

Given a brave burst and a level, get the list of effects at that burst's level

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`burst` | [BraveBurst](_datamine_types_d_.md#braveburst) | - |
`level?` | undefined \| number | the level of the entry to get; this is 1-indexed (so level 1 would get the entry at index 0)  |

**Returns:** *`Array<ProcEffect | UnknownProcEffect>`*

___

###  getHitCountData

▸ **getHitCountData**(`burst`: [BraveBurst](_datamine_types_d_.md#braveburst), `filterFn`: function): *object[]*

*Defined in [bursts.ts:62](https://github.com/BluuArc/bfmt-utilities/blob/2fa5d16/src/bursts.ts#L62)*

**Parameters:**

■` burst`: *[BraveBurst](_datamine_types_d_.md#braveburst)*

■`Default value` ` filterFn`: *function*=  (f) => isAttackingProcId(f.id)

▸ (`input`: any): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`input` | any |

**Returns:** *object[]*

___

###  getLevelEntryForBurst

▸ **getLevelEntryForBurst**(`burst`: [BraveBurst](_datamine_types_d_.md#braveburst), `level?`: undefined | number): *[BurstLevelEntry](_datamine_types_d_.md#burstlevelentry)*

*Defined in [bursts.ts:9](https://github.com/BluuArc/bfmt-utilities/blob/2fa5d16/src/bursts.ts#L9)*

Given a brave burst and a level, get the associated entry at that burst's level

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`burst` | [BraveBurst](_datamine_types_d_.md#braveburst) | - |
`level?` | undefined \| number | the level of the entry to get; this is 1-indexed (so level 1 would get the entry at index 0)  |

**Returns:** *[BurstLevelEntry](_datamine_types_d_.md#burstlevelentry)*

___