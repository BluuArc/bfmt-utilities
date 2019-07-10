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
* [getExtraAttackDamageFramesEntry](_bursts_.md#getextraattackdamageframesentry)
* [getHealFrameData](_bursts_.md#gethealframedata)
* [getLevelEntryForBurst](_bursts_.md#getlevelentryforburst)

## Functions

###  getBcDcInfo

▸ **getBcDcInfo**(`burst`: [BraveBurst](_datamine_types_d_.md#braveburst), `level?`: undefined | number): *object*

*Defined in [bursts.ts:44](https://github.com/BluuArc/bfmt-utilities/blob/c9b209e/src/bursts.ts#L44)*

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

*Defined in [bursts.ts:35](https://github.com/BluuArc/bfmt-utilities/blob/c9b209e/src/bursts.ts#L35)*

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

*Defined in [bursts.ts:117](https://github.com/BluuArc/bfmt-utilities/blob/c9b209e/src/bursts.ts#L117)*

Get a combined object containing the damage frames and effects of a given burst

**Parameters:**

■` burst`: *[BraveBurst](_datamine_types_d_.md#braveburst)*

■`Default value` ` filterFn`: *function*=  (f) => isAttackingProcId(f.id)

determine what damage frames to return based on its ID; by default, it filters for attacking effects

▸ (`input`: [IEffectFrameData](../interfaces/_bursts_.ieffectframedata.md)): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`input` | [IEffectFrameData](../interfaces/_bursts_.ieffectframedata.md) |

**Returns:** *[IEffectFrameData](../interfaces/_bursts_.ieffectframedata.md)[]*

___

###  getExtraAttackDamageFramesEntry

▸ **getExtraAttackDamageFramesEntry**(`burst`: [BraveBurst](_datamine_types_d_.md#braveburst)): *[DamageFramesEntry](_datamine_types_d_.md#damageframesentry)*

*Defined in [bursts.ts:149](https://github.com/BluuArc/bfmt-utilities/blob/c9b209e/src/bursts.ts#L149)*

Get the damage frames entry for extra attacks based on a given brave burst.

**Parameters:**

Name | Type |
------ | ------ |
`burst` | [BraveBurst](_datamine_types_d_.md#braveburst) |

**Returns:** *[DamageFramesEntry](_datamine_types_d_.md#damageframesentry)*

___

###  getHealFrameData

▸ **getHealFrameData**(`burst`: [BraveBurst](_datamine_types_d_.md#braveburst)): *[IEffectFrameData](../interfaces/_bursts_.ieffectframedata.md)[]*

*Defined in [bursts.ts:142](https://github.com/BluuArc/bfmt-utilities/blob/c9b209e/src/bursts.ts#L142)*

Get the frame data for all healing effects (i.e. with a proc ID of 2) from a given burst

**Parameters:**

Name | Type |
------ | ------ |
`burst` | [BraveBurst](_datamine_types_d_.md#braveburst) |

**Returns:** *[IEffectFrameData](../interfaces/_bursts_.ieffectframedata.md)[]*

___

###  getLevelEntryForBurst

▸ **getLevelEntryForBurst**(`burst`: [BraveBurst](_datamine_types_d_.md#braveburst), `level?`: undefined | number): *[BurstLevelEntry](_datamine_types_d_.md#burstlevelentry)*

*Defined in [bursts.ts:16](https://github.com/BluuArc/bfmt-utilities/blob/c9b209e/src/bursts.ts#L16)*

Given a brave burst and a level, get the associated entry at that burst's level

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`burst` | [BraveBurst](_datamine_types_d_.md#braveburst) | - |
`level?` | undefined \| number | the level of the entry to get; this is 1-indexed (so level 1 would get the entry at index 0)  |

**Returns:** *[BurstLevelEntry](_datamine_types_d_.md#burstlevelentry)*

___