[@bluuarc/bfmt-utilities - v0.8.0](../README.md) › [Globals](../globals.md) › ["datamine-types"](../modules/_datamine_types_.md) › [IUnit](_datamine_types_.iunit.md)

# Interface: IUnit

## Hierarchy

* **IUnit**

## Index

### Properties

* [ai](_datamine_types_.iunit.md#optional-ai)
* [ai_id](_datamine_types_.iunit.md#optional-ai_id)
* [animations](_datamine_types_.iunit.md#optional-animations)
* [associated_elgifs](_datamine_types_.iunit.md#optional-associated_elgifs)
* [bb](_datamine_types_.iunit.md#optional-bb)
* [bfmtMetadata](_datamine_types_.iunit.md#optional-bfmtmetadata)
* [bonds](_datamine_types_.iunit.md#optional-bonds)
* [category](_datamine_types_.iunit.md#optional-category)
* [cost](_datamine_types_.iunit.md#cost)
* [damage frames](_datamine_types_.iunit.md#damage-frames)
* [dictionary](_datamine_types_.iunit.md#optional-dictionary)
* [drop check count](_datamine_types_.iunit.md#drop-check-count)
* [element](_datamine_types_.iunit.md#element)
* [evolution](_datamine_types_.iunit.md#optional-evolution)
* [exp_pattern](_datamine_types_.iunit.md#exp_pattern)
* [extra skill](_datamine_types_.iunit.md#optional-extra-skill)
* [feskills](_datamine_types_.iunit.md#optional-feskills)
* [first_clear_missions](_datamine_types_.iunit.md#optional-first_clear_missions)
* [gender](_datamine_types_.iunit.md#gender)
* [getting type](_datamine_types_.iunit.md#getting-type)
* [guide_id](_datamine_types_.iunit.md#guide_id)
* [guild_raid](_datamine_types_.iunit.md#optional-guild_raid)
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
* [sell_price](_datamine_types_.iunit.md#optional-sell_price)
* [specialEffects](_datamine_types_.iunit.md#optional-specialeffects)
* [stats](_datamine_types_.iunit.md#stats)
* [ubb](_datamine_types_.iunit.md#optional-ubb)

## Properties

### `Optional` ai

• **ai**? : *[IUnitArenaAiEntry](_datamine_types_.iunitarenaaientry.md)[]*

*Defined in [datamine-types.ts:468](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L468)*

**`description`** Arena AI; determines chances for different actions in Arena..

___

### `Optional` ai_id

• **ai_id**? : *undefined | string*

*Defined in [datamine-types.ts:469](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L469)*

___

### `Optional` animations

• **animations**? : *undefined | object*

*Defined in [datamine-types.ts:470](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L470)*

___

### `Optional` associated_elgifs

• **associated_elgifs**? : *string[]*

*Defined in [datamine-types.ts:649](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L649)*

**`description`** Array of extra skill IDs that have the current unit as a condition for at least one effect.

**`author`** BluuArc

___

### `Optional` bb

• **bb**? : *[IBraveBurst](_datamine_types_.ibraveburst.md)*

*Defined in [datamine-types.ts:475](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L475)*

___

### `Optional` bfmtMetadata

• **bfmtMetadata**? : *[IBfmtMetadata](_datamine_types_.ibfmtmetadata.md)*

*Defined in [datamine-types.ts:463](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L463)*

**`author`** BluuArc

___

### `Optional` bonds

• **bonds**? : *undefined | object*

*Defined in [datamine-types.ts:479](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L479)*

___

### `Optional` category

• **category**? : *undefined | number*

*Defined in [datamine-types.ts:495](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L495)*

**`description`** Typically used to identify an evolution line of units.

___

###  cost

• **cost**: *number*

*Defined in [datamine-types.ts:496](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L496)*

___

###  damage frames

• **damage frames**: *[IDamageFramesEntry](_datamine_types_.idamageframesentry.md)*

*Defined in [datamine-types.ts:501](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L501)*

**`description`** Damage frames for a unit's normal attack.

___

### `Optional` dictionary

• **dictionary**? : *undefined | object*

*Defined in [datamine-types.ts:506](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L506)*

**`author`** BluuArc

___

###  drop check count

• **drop check count**: *number*

*Defined in [datamine-types.ts:542](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L542)*

**`description`** Maximum number of battle crystals dropped per hit on normal attack.

___

###  element

• **element**: *[UnitElement](../enums/_datamine_types_.unitelement.md)*

*Defined in [datamine-types.ts:543](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L543)*

___

### `Optional` evolution

• **evolution**? : *undefined | object*

*Defined in [datamine-types.ts:516](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L516)*

**`author`** BluuArc

___

###  exp_pattern

• **exp_pattern**: *number*

*Defined in [datamine-types.ts:548](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L548)*

**`description`** Defines the leveling curve. See [Unit Leveling](https://bravefrontierglobal.fandom.com/wiki/Unit_Leveling) for more information.

___

### `Optional` extra skill

• **extra skill**? : *[IExtraSkill](_datamine_types_.iextraskill.md)*

*Defined in [datamine-types.ts:549](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L549)*

___

### `Optional` feskills

• **feskills**? : *[ISpEnhancementEntry](_datamine_types_.ispenhancemententry.md)[]*

*Defined in [datamine-types.ts:554](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L554)*

**`author`** BluuArc

___

### `Optional` first_clear_missions

• **first_clear_missions**? : *string[]*

*Defined in [datamine-types.ts:537](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L537)*

**`description`** Array of mission IDs where this unit is a reward

**`author`** BluuArc

___

###  gender

• **gender**: *[UnitGender](../enums/_datamine_types_.unitgender.md)*

*Defined in [datamine-types.ts:555](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L555)*

___

###  getting type

• **getting type**: *[UnitGettingType](../enums/_datamine_types_.unitgettingtype.md)*

*Defined in [datamine-types.ts:560](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L560)*

**`description`** Helps determine merit value in exchange hall.

___

###  guide_id

• **guide_id**: *number*

*Defined in [datamine-types.ts:561](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L561)*

___

### `Optional` guild_raid

• **guild_raid**? : *undefined | object*

*Defined in [datamine-types.ts:487](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L487)*

**`description`** Effects that apply only during Guild Raid.

**`author`** BluuArc

___

###  id

• **id**: *number*

*Defined in [datamine-types.ts:562](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L562)*

___

###  imp

• **imp**: *object*

*Defined in [datamine-types.ts:563](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L563)*

#### Type declaration:

* **max atk**: *string*

* **max def**: *string*

* **max hp**: *string*

* **max rec**: *string*

___

###  kind

• **kind**: *[UnitKind](../enums/_datamine_types_.unitkind.md) | null*

*Defined in [datamine-types.ts:574](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L574)*

**`description`** Tells what this unit can be used for. In Deathmax's datamine, the types for
evolutions and enhancing are swapped. For example, the Fire Totem is marked as an enhancing
unit while a burst frog is marked as an evolution unit.

___

### `Optional` leader skill

• **leader skill**? : *[ILeaderSkill](_datamine_types_.ileaderskill.md)*

*Defined in [datamine-types.ts:576](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L576)*

___

###  lord damage range

• **lord damage range**: *string*

*Defined in [datamine-types.ts:581](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L581)*

**`description`** Format of `minvalue~maxvalue`.

___

###  movement

• **movement**: *object*

*Defined in [datamine-types.ts:583](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L583)*

#### Type declaration:

* **attack**: *[IUnitMovementEntry](_datamine_types_.iunitmovemententry.md)*

* **skill**? : *[IUnitMovementEntry](_datamine_types_.iunitmovemententry.md)*

___

###  name

• **name**: *string*

*Defined in [datamine-types.ts:587](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L587)*

___

###  overdrive stats

• **overdrive stats**: *object*

*Defined in [datamine-types.ts:588](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L588)*

#### Type declaration:

* **atk%**: *number*

* **def%**: *number*

* **rec%**: *number*

___

###  rarity

• **rarity**: *number*

*Defined in [datamine-types.ts:593](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L593)*

___

### `Optional` sbb

• **sbb**? : *[IBraveBurst](_datamine_types_.ibraveburst.md)*

*Defined in [datamine-types.ts:476](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L476)*

___

###  sell caution

• **sell caution**: *boolean*

*Defined in [datamine-types.ts:594](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L594)*

___

### `Optional` sell_price

• **sell_price**? : *undefined | number*

*Defined in [datamine-types.ts:595](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L595)*

___

### `Optional` specialEffects

• **specialEffects**? : *undefined | object*

*Defined in [datamine-types.ts:636](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L636)*

**`author`** BluuArc

___

###  stats

• **stats**: *object*

*Defined in [datamine-types.ts:596](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L596)*

#### Type declaration:

* **_base**: *[IUnitStatsEntry](_datamine_types_.iunitstatsentry.md)*

* **_lord**: *[IUnitStatsEntry](_datamine_types_.iunitstatsentry.md)*

* **anima**? : *undefined | object*

* **breaker**? : *undefined | object*

* **guardian**? : *undefined | object*

* **oracle**? : *undefined | object*

___

### `Optional` ubb

• **ubb**? : *[IBraveBurst](_datamine_types_.ibraveburst.md)*

*Defined in [datamine-types.ts:477](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L477)*
