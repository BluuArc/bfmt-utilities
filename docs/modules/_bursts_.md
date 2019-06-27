> ## [bfmt-utilities](../README.md)

[Globals](../globals.md) / ["bursts"](_bursts_.md) /

# External module: "bursts"

### Index

#### Functions

* [getBcDcInfo](_bursts_.md#getbcdcinfo)
* [getBurstEffects](_bursts_.md#getbursteffects)
* [getLevelEntryForBurst](_bursts_.md#getlevelentryforburst)

## Functions

###  getBcDcInfo

▸ **getBcDcInfo**(`burst`: [BraveBurst](_datamine_types_d_.md#braveburst), `level`: number | undefined): *object*

*Defined in [bursts.ts:24](https://github.com/BluuArc/bfmt-utilities/blob/dfb9803/src/bursts.ts#L24)*

Given a brave burst and a level, get the cost, hits, and dropcheck information for that burst's level

**Parameters:**

Name | Type |
------ | ------ |
`burst` | [BraveBurst](_datamine_types_d_.md#braveburst) |
`level` | number \| undefined |

**Returns:** *object*

* **cost**: *number*

* **dropchecks**: *number*

* **hits**: *number*

___

###  getBurstEffects

▸ **getBurstEffects**(`burst`: [BraveBurst](_datamine_types_d_.md#braveburst), `level`: number | undefined): *`Array<ProcEffect | UnknownProcEffect>`*

*Defined in [bursts.ts:16](https://github.com/BluuArc/bfmt-utilities/blob/dfb9803/src/bursts.ts#L16)*

Given a brave burst and a level, get the list of effects at that burst's level

**Parameters:**

Name | Type |
------ | ------ |
`burst` | [BraveBurst](_datamine_types_d_.md#braveburst) |
`level` | number \| undefined |

**Returns:** *`Array<ProcEffect | UnknownProcEffect>`*

___

###  getLevelEntryForBurst

▸ **getLevelEntryForBurst**(`burst`: [BraveBurst](_datamine_types_d_.md#braveburst), `level`: number | undefined): *[BurstLevelEntry](_datamine_types_d_.md#burstlevelentry)*

*Defined in [bursts.ts:7](https://github.com/BluuArc/bfmt-utilities/blob/dfb9803/src/bursts.ts#L7)*

Given a brave burst and a level, get the associated entry at that burst's level

**Parameters:**

Name | Type |
------ | ------ |
`burst` | [BraveBurst](_datamine_types_d_.md#braveburst) |
`level` | number \| undefined |

**Returns:** *[BurstLevelEntry](_datamine_types_d_.md#burstlevelentry)*

___