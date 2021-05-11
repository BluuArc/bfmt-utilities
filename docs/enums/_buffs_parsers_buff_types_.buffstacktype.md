[@bluuarc/bfmt-utilities - v0.8.0](../README.md) › [Globals](../globals.md) › ["buffs/parsers/buff-types"](../modules/_buffs_parsers_buff_types_.md) › [BuffStackType](_buffs_parsers_buff_types_.buffstacktype.md)

# Enumeration: BuffStackType

**`description`** Provides info at a glance regarding a buff's source and how it stacks.

## Index

### Enumeration members

* [Active](_buffs_parsers_buff_types_.buffstacktype.md#active)
* [Attack](_buffs_parsers_buff_types_.buffstacktype.md#attack)
* [Burst](_buffs_parsers_buff_types_.buffstacktype.md#burst)
* [ConditionalTimed](_buffs_parsers_buff_types_.buffstacktype.md#conditionaltimed)
* [Passive](_buffs_parsers_buff_types_.buffstacktype.md#passive)
* [Singleton](_buffs_parsers_buff_types_.buffstacktype.md#singleton)
* [Unknown](_buffs_parsers_buff_types_.buffstacktype.md#unknown)

## Enumeration members

###  Active

• **Active**: = "active"

*Defined in [buffs/parsers/buff-types.ts:14](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-types.ts#L14)*

**`description`** The buff is activated via some skill and lasts for a number of turns.
Sometimes referred to as procs. Buffs of the same type do not stack unless if they're
from different levels. Two possible levels of sources are:
1. Brave Burst or Super Brave Burst (also includes enemy skills)
2. Ultimate Brave Burst or Dual Brave Burst

___

###  Attack

• **Attack**: = "attack"

*Defined in [buffs/parsers/buff-types.ts:44](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-types.ts#L44)*

**`description`** A specific subset of `Burst` type buffs that deal damage to the target.

___

###  Burst

• **Burst**: = "burst"

*Defined in [buffs/parsers/buff-types.ts:39](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-types.ts#L39)*

**`description`** The buff's effects immediately apply to the target(s). This differs from singleton
in that these values aren't permanent and some effects can "stack" (e.g. using two burst heals results
in the HP bar filling by the sum of those burst heals).

___

###  ConditionalTimed

• **ConditionalTimed**: = "conditionalTimed"

*Defined in [buffs/parsers/buff-types.ts:26](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-types.ts#L26)*

**`description`** The buff is applied for a number of turns once a certain condition is met.
Buffs of the same type are not able to stack.

___

###  Passive

• **Passive**: = "passive"

*Defined in [buffs/parsers/buff-types.ts:20](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-types.ts#L20)*

**`description`** The buff is always active provided that the source is not nullified.
Most passive buffs can stack with themselves.

___

###  Singleton

• **Singleton**: = "singleton"

*Defined in [buffs/parsers/buff-types.ts:32](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-types.ts#L32)*

**`description`** Only one instance of the buff can be active at a time and can last indefinitely.
A couple examples of this are Barrier and Max HP Boost.

___

###  Unknown

• **Unknown**: = "unknown"

*Defined in [buffs/parsers/buff-types.ts:49](https://github.com/BluuArc/bfmt-utilities/blob/master/src/buffs/parsers/buff-types.ts#L49)*

**`description`** Only for buffs that cannot be processed by the library yet.
