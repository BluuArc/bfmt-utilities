[bfmt-utilities](../README.md) › [Globals](../globals.md) › ["datamine-types"](../modules/_datamine_types_.md) › [IUnit](_datamine_types_.iunit.md)

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

*Defined in [datamine-types.ts:277](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L277)*

**`description`** Arena AI; determines chances for different actions in Arena.

___

### `Optional` animations

• **animations**? : *undefined | object*

*Defined in [datamine-types.ts:278](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L278)*

___

### `Optional` bb

• **bb**? : *[IBraveBurst](_datamine_types_.ibraveburst.md)*

*Defined in [datamine-types.ts:283](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L283)*

___

### `Optional` category

• **category**? : *undefined | number*

*Defined in [datamine-types.ts:290](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L290)*

**`description`** Typically used to identify an evolution line of units.

___

###  cost

• **cost**: *number*

*Defined in [datamine-types.ts:291](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L291)*

___

###  damage frames

• **damage frames**: *[IDamageFramesEntry](_datamine_types_.idamageframesentry.md)*

*Defined in [datamine-types.ts:296](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L296)*

**`description`** Damage frames for a unit's normal attack.

___

### `Optional` dictionary

• **dictionary**? : *undefined | object*

*Defined in [datamine-types.ts:301](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L301)*

**`author`** BluuArc

___

###  drop check count

• **drop check count**: *number*

*Defined in [datamine-types.ts:311](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L311)*

**`description`** Maximum number of battle crystals dropped per hit on normal attack.

___

###  element

• **element**: *[UnitElement](../enums/_datamine_types_.unitelement.md)*

*Defined in [datamine-types.ts:312](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L312)*

___

###  exp_pattern

• **exp_pattern**: *number*

*Defined in [datamine-types.ts:317](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L317)*

**`description`** Defines the leveling curve. See [Unit Leveling](https://bravefrontierglobal.fandom.com/wiki/Unit_Leveling) for more information.

___

### `Optional` extra skill

• **extra skill**? : *[IExtraSkill](_datamine_types_.iextraskill.md)*

*Defined in [datamine-types.ts:318](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L318)*

___

### `Optional` feskills

• **feskills**? : *[ISpEnhancementEntry](_datamine_types_.ispenhancemententry.md)[]*

*Defined in [datamine-types.ts:319](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L319)*

___

###  gender

• **gender**: *[UnitGender](../enums/_datamine_types_.unitgender.md)*

*Defined in [datamine-types.ts:320](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L320)*

___

###  getting type

• **getting type**: *[UnitGettingType](../enums/_datamine_types_.unitgettingtype.md)*

*Defined in [datamine-types.ts:325](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L325)*

**`description`** Helps determine merit value in exchange hall

___

###  guide_id

• **guide_id**: *number*

*Defined in [datamine-types.ts:326](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L326)*

___

###  id

• **id**: *number*

*Defined in [datamine-types.ts:327](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L327)*

___

###  imp

• **imp**: *object*

*Defined in [datamine-types.ts:328](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L328)*

#### Type declaration:

* **max atk**: *string*

* **max def**: *string*

* **max hp**: *string*

* **max rec**: *string*

___

###  kind

• **kind**: *[UnitKind](../enums/_datamine_types_.unitkind.md) | null*

*Defined in [datamine-types.ts:339](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L339)*

**`description`** Tells what this unit can be used for. In Deathmax's datamine, the types for
evolutions and enhancing are swapped. For example, the Fire Totem is marked as an enhancing
unit while a burst frog is marked as an evolution unit.

___

###  lord damage range

• **lord damage range**: *string*

*Defined in [datamine-types.ts:344](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L344)*

**`description`** format of `minvalue~maxvalue`

___

###  movement

• **movement**: *object*

*Defined in [datamine-types.ts:346](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L346)*

#### Type declaration:

* **attack**: *[IUnitMovemmentEntry](_datamine_types_.iunitmovemmententry.md)*

* **skill**? : *[IUnitMovemmentEntry](_datamine_types_.iunitmovemmententry.md)*

___

###  name

• **name**: *string*

*Defined in [datamine-types.ts:350](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L350)*

___

###  overdrive stats

• **overdrive stats**: *object*

*Defined in [datamine-types.ts:351](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L351)*

#### Type declaration:

* **atk%**: *number*

* **def%**: *number*

* **rec%**: *number*

___

###  rarity

• **rarity**: *number*

*Defined in [datamine-types.ts:356](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L356)*

___

### `Optional` sbb

• **sbb**? : *[IBraveBurst](_datamine_types_.ibraveburst.md)*

*Defined in [datamine-types.ts:284](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L284)*

___

###  sell caution

• **sell caution**: *boolean*

*Defined in [datamine-types.ts:357](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L357)*

___

###  stats

• **stats**: *object*

*Defined in [datamine-types.ts:358](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L358)*

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

*Defined in [datamine-types.ts:285](https://github.com/BluuArc/bfmt-utilities/blob/dc2bfb7/src/datamine-types.ts#L285)*
