[@bluuarc/bfmt-utilities - v0.6.0](../README.md) › [Globals](../globals.md) › ["bursts/getLevelEntryForBurst"](_bursts_getlevelentryforburst_.md)

# Module: "bursts/getLevelEntryForBurst"

## Index

### Functions

* [getLevelEntryForBurst](_bursts_getlevelentryforburst_.md#getlevelentryforburst)

## Functions

###  getLevelEntryForBurst

▸ **getLevelEntryForBurst**(`burst`: [IBraveBurst](../interfaces/_datamine_types_.ibraveburst.md), `level?`: undefined | number): *[IBurstLevelEntry](../interfaces/_datamine_types_.iburstlevelentry.md) | undefined*

*Defined in [bursts/getLevelEntryForBurst.ts:9](https://github.com/BluuArc/bfmt-utilities/blob/master/src/bursts/getLevelEntryForBurst.ts#L9)*

**`description`** Get the level entry of a burst at a given level (or the last level if no level is given).

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`burst` | [IBraveBurst](../interfaces/_datamine_types_.ibraveburst.md) | Burst to get level entry from. |
`level?` | undefined &#124; number | Optional 1-indexed level to get; if not specified, the last level of the burst is used. |

**Returns:** *[IBurstLevelEntry](../interfaces/_datamine_types_.iburstlevelentry.md) | undefined*

Level entry of a burst at a given level (or last level if no level is given) if it exists, undefined otherwise.
