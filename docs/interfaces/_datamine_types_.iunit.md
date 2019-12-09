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

*Defined in [datamine-types.ts:305](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L305)*

**`description`** Arena AI; determines chances for different actions in Arena.

___

### `Optional` animations

• **animations**? : *undefined | object*

*Defined in [datamine-types.ts:306](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L306)*

___

### `Optional` bb

• **bb**? : *[IBraveBurst](_datamine_types_.ibraveburst.md)*

*Defined in [datamine-types.ts:311](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L311)*

___

### `Optional` category

• **category**? : *undefined | number*

*Defined in [datamine-types.ts:318](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L318)*

**`description`** Typically used to identify an evolution line of units.

___

###  cost

• **cost**: *number*

*Defined in [datamine-types.ts:319](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L319)*

___

###  damage frames

• **damage frames**: *[IDamageFramesEntry](_datamine_types_.idamageframesentry.md)*

*Defined in [datamine-types.ts:324](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L324)*

**`description`** Damage frames for a unit's normal attack.

___

### `Optional` dictionary

• **dictionary**? : *undefined | object*

*Defined in [datamine-types.ts:329](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L329)*

**`author`** BluuArc

___

###  drop check count

• **drop check count**: *number*

*Defined in [datamine-types.ts:339](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L339)*

**`description`** Maximum number of battle crystals dropped per hit on normal attack.

___

###  element

• **element**: *[UnitElement](../enums/_datamine_types_.unitelement.md)*

*Defined in [datamine-types.ts:340](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L340)*

___

###  exp_pattern

• **exp_pattern**: *number*

*Defined in [datamine-types.ts:345](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L345)*

**`description`** Defines the leveling curve. See [Unit Leveling](https://bravefrontierglobal.fandom.com/wiki/Unit_Leveling) for more information.

___

### `Optional` extra skill

• **extra skill**? : *[IExtraSkill](_datamine_types_.iextraskill.md)*

*Defined in [datamine-types.ts:346](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L346)*

___

### `Optional` feskills

• **feskills**? : *[ISpEnhancementEntry](_datamine_types_.ispenhancemententry.md)[]*

*Defined in [datamine-types.ts:351](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L351)*

**`author`** BluuArc

___

###  gender

• **gender**: *[UnitGender](../enums/_datamine_types_.unitgender.md)*

*Defined in [datamine-types.ts:352](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L352)*

___

###  getting type

• **getting type**: *[UnitGettingType](../enums/_datamine_types_.unitgettingtype.md)*

*Defined in [datamine-types.ts:357](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L357)*

**`description`** Helps determine merit value in exchange hall

___

###  guide_id

• **guide_id**: *number*

*Defined in [datamine-types.ts:358](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L358)*

___

###  id

• **id**: *number*

*Defined in [datamine-types.ts:359](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L359)*

___

###  imp

• **imp**: *object*

*Defined in [datamine-types.ts:360](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L360)*

#### Type declaration:

* **max atk**: *string*

* **max def**: *string*

* **max hp**: *string*

* **max rec**: *string*

___

###  kind

• **kind**: *[UnitKind](../enums/_datamine_types_.unitkind.md) | null*

*Defined in [datamine-types.ts:371](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L371)*

**`description`** Tells what this unit can be used for. In Deathmax's datamine, the types for
evolutions and enhancing are swapped. For example, the Fire Totem is marked as an enhancing
unit while a burst frog is marked as an evolution unit.

___

###  lord damage range

• **lord damage range**: *string*

*Defined in [datamine-types.ts:376](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L376)*

**`description`** format of `minvalue~maxvalue`

___

###  movement

• **movement**: *object*

*Defined in [datamine-types.ts:378](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L378)*

#### Type declaration:

* **attack**: *[IUnitMovementEntry](_datamine_types_.iunitmovemententry.md)*

* **skill**? : *[IUnitMovementEntry](_datamine_types_.iunitmovemententry.md)*

___

###  name

• **name**: *string*

*Defined in [datamine-types.ts:382](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L382)*

___

###  overdrive stats

• **overdrive stats**: *object*

*Defined in [datamine-types.ts:383](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L383)*

#### Type declaration:

* **atk%**: *number*

* **def%**: *number*

* **rec%**: *number*

___

###  rarity

• **rarity**: *number*

*Defined in [datamine-types.ts:388](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L388)*

___

### `Optional` sbb

• **sbb**? : *[IBraveBurst](_datamine_types_.ibraveburst.md)*

*Defined in [datamine-types.ts:312](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L312)*

___

###  sell caution

• **sell caution**: *boolean*

*Defined in [datamine-types.ts:389](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L389)*

___

###  stats

• **stats**: *object*

*Defined in [datamine-types.ts:390](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L390)*

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

*Defined in [datamine-types.ts:313](https://github.com/BluuArc/bfmt-utilities/blob/2dbb89b/src/datamine-types.ts#L313)*
