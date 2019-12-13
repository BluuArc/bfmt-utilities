[@bluuarc/bfmt-utilities](../README.md) › [Globals](../globals.md) › ["bursts"](_bursts_.md)

# External module: "bursts"

## Index

### Functions

* [getEffectsForBurst](_bursts_.md#geteffectsforburst)
* [getExtraAttackDamageFramesEntry](_bursts_.md#getextraattackdamageframesentry)
* [getLevelEntryForBurst](_bursts_.md#getlevelentryforburst)

## Functions

###  getEffectsForBurst

▸ **getEffectsForBurst**(`burst`: [IBraveBurst](../interfaces/_datamine_types_.ibraveburst.md), `level?`: undefined | number): *[ProcEffect](_datamine_types_.md#proceffect)[]*

*Defined in [bursts.ts:34](https://github.com/BluuArc/bfmt-utilities/blob/cf39af8/src/bursts.ts#L34)*

**`description`** Grab the effects at the level entry of a burst at a given level (or the last level if no level is given)

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`burst` | [IBraveBurst](../interfaces/_datamine_types_.ibraveburst.md) | Burst to get effects from |
`level?` | undefined &#124; number | Optional 1-indexed level to get entries from; if not specified, the last level of the burst is used.  |

**Returns:** *[ProcEffect](_datamine_types_.md#proceffect)[]*

___

###  getExtraAttackDamageFramesEntry

▸ **getExtraAttackDamageFramesEntry**(`damageFrames`: [IBurstDamageFramesEntry](../interfaces/_datamine_types_.iburstdamageframesentry.md)[], `effectDelay`: string): *[IDamageFramesEntry](../interfaces/_datamine_types_.idamageframesentry.md)*

*Defined in [bursts.ts:39](https://github.com/BluuArc/bfmt-utilities/blob/cf39af8/src/bursts.ts#L39)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`damageFrames` | [IBurstDamageFramesEntry](../interfaces/_datamine_types_.iburstdamageframesentry.md)[] | - |
`effectDelay` | string | "0.0/0" |

**Returns:** *[IDamageFramesEntry](../interfaces/_datamine_types_.idamageframesentry.md)*

___

###  getLevelEntryForBurst

▸ **getLevelEntryForBurst**(`burst`: [IBraveBurst](../interfaces/_datamine_types_.ibraveburst.md), `level?`: undefined | number): *[IBurstLevelEntry](../interfaces/_datamine_types_.iburstlevelentry.md) | undefined*

*Defined in [bursts.ts:16](https://github.com/BluuArc/bfmt-utilities/blob/cf39af8/src/bursts.ts#L16)*

**`description`** Grab the level entry of a burst at a given level (or the last level if no level is given)

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`burst` | [IBraveBurst](../interfaces/_datamine_types_.ibraveburst.md) | Burst to get level entry from |
`level?` | undefined &#124; number | Optional 1-indexed level to get; if not specified, the last level of the burst is used.  |

**Returns:** *[IBurstLevelEntry](../interfaces/_datamine_types_.iburstlevelentry.md) | undefined*
