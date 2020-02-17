[@bluuarc/bfmt-utilities](../README.md) › [Globals](../globals.md) › ["datamine-types"](../modules/_datamine_types_.md) › [IUnit](_datamine_types_.iunit.md)

# Interface: IUnit

## Hierarchy

* **IUnit**

## Index

### Properties

* [ai](_datamine_types_.iunit.md#optional-ai)
* [animations](_datamine_types_.iunit.md#optional-animations)
* [bb](_datamine_types_.iunit.md#optional-bb)
* [category](_datamine_types_.iunit.md#optional-category)
* [cost](_datamine_types_.iunit.md#cost)
* [damage frames](_datamine_types_.iunit.md#damage-frames)
* [dictionary](_datamine_types_.iunit.md#optional-dictionary)
* [drop check count](_datamine_types_.iunit.md#drop-check-count)
* [element](_datamine_types_.iunit.md#element)
* [exp_pattern](_datamine_types_.iunit.md#exp_pattern)
* [extra skill](_datamine_types_.iunit.md#optional-extra-skill)
* [feskills](_datamine_types_.iunit.md#optional-feskills)
* [gender](_datamine_types_.iunit.md#gender)
* [getting type](_datamine_types_.iunit.md#getting-type)
* [guide_id](_datamine_types_.iunit.md#guide_id)
* [id](_datamine_types_.iunit.md#id)
* [imp](_datamine_types_.iunit.md#imp)
* [kind](_datamine_types_.iunit.md#kind)
* [leader skill](_datamine_types_.iunit.md#optional-leader-skill)
* [lord damage range](_datamine_types_.iunit.md#lord-damage-range)
* [movement](_datamine_types_.iunit.md#movement)
* [name](_datamine_types_.iunit.md#name)
* [overdrive stats](_datamine_types_.iunit.md#overdrive-stats)
* [rarity](_datamine_types_.iunit.md#rarity)
* [sbb](_datamine_types_.iunit.md#optional-sbb)
* [sell caution](_datamine_types_.iunit.md#sell-caution)
* [stats](_datamine_types_.iunit.md#stats)
* [ubb](_datamine_types_.iunit.md#optional-ubb)

## Properties

### `Optional` ai

• **ai**? : *[IUnitArenaAiEntry](_datamine_types_.iunitarenaaientry.md)[]*

*Defined in [datamine-types.ts:328](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L328)*

**`description`** Arena AI; determines chances for different actions in Arena.

___

### `Optional` animations

• **animations**? : *undefined | object*

*Defined in [datamine-types.ts:329](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L329)*

___

### `Optional` bb

• **bb**? : *[IBraveBurst](_datamine_types_.ibraveburst.md)*

*Defined in [datamine-types.ts:334](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L334)*

___

### `Optional` category

• **category**? : *undefined | number*

*Defined in [datamine-types.ts:341](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L341)*

**`description`** Typically used to identify an evolution line of units.

___

###  cost

• **cost**: *number*

*Defined in [datamine-types.ts:342](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L342)*

___

###  damage frames

• **damage frames**: *[IDamageFramesEntry](_datamine_types_.idamageframesentry.md)*

*Defined in [datamine-types.ts:347](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L347)*

**`description`** Damage frames for a unit's normal attack.

___

### `Optional` dictionary

• **dictionary**? : *undefined | object*

*Defined in [datamine-types.ts:352](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L352)*

**`author`** BluuArc

___

###  drop check count

• **drop check count**: *number*

*Defined in [datamine-types.ts:362](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L362)*

**`description`** Maximum number of battle crystals dropped per hit on normal attack.

___

###  element

• **element**: *[UnitElement](../enums/_datamine_types_.unitelement.md)*

*Defined in [datamine-types.ts:363](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L363)*

___

###  exp_pattern

• **exp_pattern**: *number*

*Defined in [datamine-types.ts:368](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L368)*

**`description`** Defines the leveling curve. See [Unit Leveling](https://bravefrontierglobal.fandom.com/wiki/Unit_Leveling) for more information.

___

### `Optional` extra skill

• **extra skill**? : *[IExtraSkill](_datamine_types_.iextraskill.md)*

*Defined in [datamine-types.ts:369](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L369)*

___

### `Optional` feskills

• **feskills**? : *[ISpEnhancementEntry](_datamine_types_.ispenhancemententry.md)[]*

*Defined in [datamine-types.ts:374](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L374)*

**`author`** BluuArc

___

###  gender

• **gender**: *[UnitGender](../enums/_datamine_types_.unitgender.md)*

*Defined in [datamine-types.ts:375](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L375)*

___

###  getting type

• **getting type**: *[UnitGettingType](../enums/_datamine_types_.unitgettingtype.md)*

*Defined in [datamine-types.ts:380](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L380)*

**`description`** Helps determine merit value in exchange hall

___

###  guide_id

• **guide_id**: *number*

*Defined in [datamine-types.ts:381](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L381)*

___

###  id

• **id**: *number*

*Defined in [datamine-types.ts:382](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L382)*

___

###  imp

• **imp**: *object*

*Defined in [datamine-types.ts:383](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L383)*

#### Type declaration:

* **max atk**: *string*

* **max def**: *string*

* **max hp**: *string*

* **max rec**: *string*

___

###  kind

• **kind**: *[UnitKind](../enums/_datamine_types_.unitkind.md) | null*

*Defined in [datamine-types.ts:394](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L394)*

**`description`** Tells what this unit can be used for. In Deathmax's datamine, the types for
evolutions and enhancing are swapped. For example, the Fire Totem is marked as an enhancing
unit while a burst frog is marked as an evolution unit.

___

### `Optional` leader skill

• **leader skill**? : *[ILeaderSkill](_datamine_types_.ileaderskill.md)*

*Defined in [datamine-types.ts:396](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L396)*

___

###  lord damage range

• **lord damage range**: *string*

*Defined in [datamine-types.ts:401](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L401)*

**`description`** format of `minvalue~maxvalue`

___

###  movement

• **movement**: *object*

*Defined in [datamine-types.ts:403](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L403)*

#### Type declaration:

* **attack**: *[IUnitMovementEntry](_datamine_types_.iunitmovemententry.md)*

* **skill**? : *[IUnitMovementEntry](_datamine_types_.iunitmovemententry.md)*

___

###  name

• **name**: *string*

*Defined in [datamine-types.ts:407](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L407)*

___

###  overdrive stats

• **overdrive stats**: *object*

*Defined in [datamine-types.ts:408](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L408)*

#### Type declaration:

* **atk%**: *number*

* **def%**: *number*

* **rec%**: *number*

___

###  rarity

• **rarity**: *number*

*Defined in [datamine-types.ts:413](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L413)*

___

### `Optional` sbb

• **sbb**? : *[IBraveBurst](_datamine_types_.ibraveburst.md)*

*Defined in [datamine-types.ts:335](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L335)*

___

###  sell caution

• **sell caution**: *boolean*

*Defined in [datamine-types.ts:414](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L414)*

___

###  stats

• **stats**: *object*

*Defined in [datamine-types.ts:415](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L415)*

#### Type declaration:

* **_base**: *[IUnitStatsEntry](_datamine_types_.iunitstatsentry.md)*

* **_lord**: *[IUnitStatsEntry](_datamine_types_.iunitstatsentry.md)*

* **anima**(): *object*

  * **atk**: *number*

  * **def**: *number*

  * **hp max**: *number*

  * **hp min**: *number*

  * **rec max**: *number*

  * **rec min**: *number*

* **breaker**(): *object*

  * **atk max**: *number*

  * **atk min**: *number*

  * **def max**: *number*

  * **def min**: *number*

  * **hp**: *number*

  * **rec**: *number*

* **guardian**(): *object*

  * **atk**: *number*

  * **def max**: *number*

  * **def min**: *number*

  * **hp**: *number*

  * **rec max**: *number*

  * **rec min**: *number*

* **oracle**(): *object*

  * **atk**: *number*

  * **def**: *number*

  * **hp max**: *number*

  * **hp min**: *number*

  * **rec max**: *number*

  * **rec min**: *number*

___

### `Optional` ubb

• **ubb**? : *[IBraveBurst](_datamine_types_.ibraveburst.md)*

*Defined in [datamine-types.ts:336](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L336)*
