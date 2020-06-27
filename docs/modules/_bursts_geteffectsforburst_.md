[@bluuarc/bfmt-utilities - v0.7.0](../README.md) › [Globals](../globals.md) › ["bursts/getEffectsForBurst"](_bursts_geteffectsforburst_.md)

# Module: "bursts/getEffectsForBurst"

## Index

### Functions

* [getEffectsForBurst](_bursts_geteffectsforburst_.md#geteffectsforburst)

## Functions

###  getEffectsForBurst

▸ **getEffectsForBurst**(`burst`: [IBraveBurst](../interfaces/_datamine_types_.ibraveburst.md), `level?`: undefined | number): *[ProcEffect](_datamine_types_.md#proceffect)[]*

*Defined in [bursts/getEffectsForBurst.ts:10](https://github.com/BluuArc/bfmt-utilities/blob/master/src/bursts/getEffectsForBurst.ts#L10)*

**`description`** Get the effects at the level entry of a burst at a given level (or the last level if no level is given).

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`burst` | [IBraveBurst](../interfaces/_datamine_types_.ibraveburst.md) | Burst to get effects from. |
`level?` | undefined &#124; number | Optional 1-indexed level to get entries from; if not specified, the last level of the burst is used. |

**Returns:** *[ProcEffect](_datamine_types_.md#proceffect)[]*

Effects at the level entry of a burst at a given level (or last level if no level is given) if it exists, an empty array otherwise.
