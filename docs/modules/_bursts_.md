> ## [bfmt-utilities](../README.md)

[Globals](../globals.md) / ["bursts"](_bursts_.md) /

# External module: "bursts"

### Index

#### Interfaces

* [IEffectFrameData](../interfaces/_bursts_.ieffectframedata.md)

#### Functions

* [getBcDcInfo](_bursts_.md#getbcdcinfo)
* [getBurstEffects](_bursts_.md#getbursteffects)
* [getEffectFrameData](_bursts_.md#geteffectframedata)
* [getHealFrameData](_bursts_.md#gethealframedata)
* [getLevelEntryForBurst](_bursts_.md#getlevelentryforburst)

## Functions

###  getBcDcInfo

▸ **getBcDcInfo**(`burst`: [BraveBurst](_datamine_types_d_.md#braveburst), `level?`: undefined | number): *object*

*Defined in [bursts.ts:43](https://github.com/BluuArc/bfmt-utilities/blob/1179835/src/bursts.ts#L43)*

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

*Defined in [bursts.ts:34](https://github.com/BluuArc/bfmt-utilities/blob/1179835/src/bursts.ts#L34)*

Given a brave burst and a level, get the list of effects at that burst's level

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`burst` | [BraveBurst](_datamine_types_d_.md#braveburst) | - |
`level?` | undefined \| number | the level of the entry to get; this is 1-indexed (so level 1 would get the entry at index 0)  |

**Returns:** *`Array<ProcEffect | UnknownProcEffect>`*

___

###  getEffectFrameData

▸ **getEffectFrameData**(`burst`: [BraveBurst](_datamine_types_d_.md#braveburst), `filterFn`: function): *[IEffectFrameData](../interfaces/_bursts_.ieffectframedata.md)[]*

*Defined in [bursts.ts:116](https://github.com/BluuArc/bfmt-utilities/blob/1179835/src/bursts.ts#L116)*

Get a combined object containing the damage frames and effects of a given burst

**Parameters:**

■` burst`: *[BraveBurst](_datamine_types_d_.md#braveburst)*

■`Default value` ` filterFn`: *function*=  (f) => isAttackingProcId(f.id)

determine what damage frames to return based on its ID

▸ (`input`: [IEffectFrameData](../interfaces/_bursts_.ieffectframedata.md)): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`input` | [IEffectFrameData](../interfaces/_bursts_.ieffectframedata.md) |

**Returns:** *[IEffectFrameData](../interfaces/_bursts_.ieffectframedata.md)[]*

___

###  getHealFrameData

▸ **getHealFrameData**(`burst`: [BraveBurst](_datamine_types_d_.md#braveburst)): *[IEffectFrameData](../interfaces/_bursts_.ieffectframedata.md)[]*

*Defined in [bursts.ts:141](https://github.com/BluuArc/bfmt-utilities/blob/1179835/src/bursts.ts#L141)*

Get the frame data for all healing effects (i.e. with a proc ID of 2) from a given burst

**Parameters:**

Name | Type |
------ | ------ |
`burst` | [BraveBurst](_datamine_types_d_.md#braveburst) |

**Returns:** *[IEffectFrameData](../interfaces/_bursts_.ieffectframedata.md)[]*

___

###  getLevelEntryForBurst

▸ **getLevelEntryForBurst**(`burst`: [BraveBurst](_datamine_types_d_.md#braveburst), `level?`: undefined | number): *[BurstLevelEntry](_datamine_types_d_.md#burstlevelentry)*

*Defined in [bursts.ts:15](https://github.com/BluuArc/bfmt-utilities/blob/1179835/src/bursts.ts#L15)*

Given a brave burst and a level, get the associated entry at that burst's level

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`burst` | [BraveBurst](_datamine_types_d_.md#braveburst) | - |
`level?` | undefined \| number | the level of the entry to get; this is 1-indexed (so level 1 would get the entry at index 0)  |

**Returns:** *[BurstLevelEntry](_datamine_types_d_.md#burstlevelentry)*

___