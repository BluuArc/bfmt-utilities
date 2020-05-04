[@bluuarc/bfmt-utilities - v0.5.0](../README.md) › [Globals](../globals.md) › ["bursts"](_bursts_.md)

# Module: "bursts"

## Index

### Functions

* [getEffectsForBurst](_bursts_.md#geteffectsforburst)
* [getExtraAttackDamageFramesEntry](_bursts_.md#getextraattackdamageframesentry)
* [getLevelEntryForBurst](_bursts_.md#getlevelentryforburst)

## Functions

###  getEffectsForBurst

▸ **getEffectsForBurst**(`burst`: [IBraveBurst](../interfaces/_datamine_types_.ibraveburst.md), `level?`: undefined | number): *[ProcEffect](_datamine_types_.md#proceffect)[]*

*Defined in [bursts.ts:36](https://github.com/BluuArc/bfmt-utilities/blob/master/src/bursts.ts#L36)*

**`description`** Grab the effects at the level entry of a burst at a given level (or the last level if no level is given)

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`burst` | [IBraveBurst](../interfaces/_datamine_types_.ibraveburst.md) | Burst to get effects from |
`level?` | undefined &#124; number | Optional 1-indexed level to get entries from; if not specified, the last level of the burst is used. |

**Returns:** *[ProcEffect](_datamine_types_.md#proceffect)[]*

the effects at the level entry of a burst at a given level (or last level if no level is given) if it exists, an empty array otherwise

___

###  getExtraAttackDamageFramesEntry

▸ **getExtraAttackDamageFramesEntry**(`damageFrames`: [IBurstDamageFramesEntry](../interfaces/_datamine_types_.iburstdamageframesentry.md)[], `effectDelay`: string): *[IDamageFramesEntry](../interfaces/_datamine_types_.idamageframesentry.md)*

*Defined in [bursts.ts:47](https://github.com/BluuArc/bfmt-utilities/blob/master/src/bursts.ts#L47)*

**`description`** Get the extra attack damage frames entry based on the damage frames of a burst. Also apply the given effect delay to the resulting damage frames entry.

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`damageFrames` | [IBurstDamageFramesEntry](../interfaces/_datamine_types_.iburstdamageframesentry.md)[] | - | damage frames that each have their own proc ID |
`effectDelay` | string | "0.0/0" | optional effect delay to apply to the resulting damage frames entry |

**Returns:** *[IDamageFramesEntry](../interfaces/_datamine_types_.idamageframesentry.md)*

damage frames entry whose frames are based on the input damage frames

___

###  getLevelEntryForBurst

▸ **getLevelEntryForBurst**(`burst`: [IBraveBurst](../interfaces/_datamine_types_.ibraveburst.md), `level?`: undefined | number): *[IBurstLevelEntry](../interfaces/_datamine_types_.iburstlevelentry.md) | undefined*

*Defined in [bursts.ts:17](https://github.com/BluuArc/bfmt-utilities/blob/master/src/bursts.ts#L17)*

**`description`** Grab the level entry of a burst at a given level (or the last level if no level is given)

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`burst` | [IBraveBurst](../interfaces/_datamine_types_.ibraveburst.md) | Burst to get level entry from |
`level?` | undefined &#124; number | Optional 1-indexed level to get; if not specified, the last level of the burst is used. |

**Returns:** *[IBurstLevelEntry](../interfaces/_datamine_types_.iburstlevelentry.md) | undefined*

the level entry of a burst at a given level (or last level if no level is given) if it exists, undefined otherwise
