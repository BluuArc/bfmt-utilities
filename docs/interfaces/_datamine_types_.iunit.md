[@bluuarc/bfmt-utilities - v0.6.0](../README.md) › [Globals](../globals.md) › ["datamine-types"](../modules/_datamine_types_.md) › [IUnit](_datamine_types_.iunit.md)

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

*Defined in [datamine-types.ts:453](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L453)*

**`description`** Arena AI; determines chances for different actions in Arena.

___

### `Optional` ai_id

• **ai_id**? : *undefined | string*

*Defined in [datamine-types.ts:454](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L454)*

___

### `Optional` animations

• **animations**? : *undefined | object*

*Defined in [datamine-types.ts:455](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L455)*

___

### `Optional` associated_elgifs

• **associated_elgifs**? : *string[]*

*Defined in [datamine-types.ts:633](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L633)*

**`description`** Array of extra skill IDs that have the current unit as a condition for at least one effect.

**`author`** BluuArc

___

### `Optional` bb

• **bb**? : *[IBraveBurst](_datamine_types_.ibraveburst.md)*

*Defined in [datamine-types.ts:460](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L460)*

___

### `Optional` bfmtMetadata

• **bfmtMetadata**? : *[IBfmtMetadata](_datamine_types_.ibfmtmetadata.md)*

*Defined in [datamine-types.ts:448](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L448)*

**`author`** BluuArc

___

### `Optional` bonds

• **bonds**? : *undefined | object*

*Defined in [datamine-types.ts:464](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L464)*

___

### `Optional` category

• **category**? : *undefined | number*

*Defined in [datamine-types.ts:480](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L480)*

**`description`** Typically used to identify an evolution line of units.

___

###  cost

• **cost**: *number*

*Defined in [datamine-types.ts:481](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L481)*

___

###  damage frames

• **damage frames**: *[IDamageFramesEntry](_datamine_types_.idamageframesentry.md)*

*Defined in [datamine-types.ts:486](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L486)*

**`description`** Damage frames for a unit's normal attack.

___

### `Optional` dictionary

• **dictionary**? : *undefined | object*

*Defined in [datamine-types.ts:491](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L491)*

**`author`** BluuArc

___

###  drop check count

• **drop check count**: *number*

*Defined in [datamine-types.ts:526](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L526)*

**`description`** Maximum number of battle crystals dropped per hit on normal attack.

___

###  element

• **element**: *[UnitElement](../enums/_datamine_types_.unitelement.md)*

*Defined in [datamine-types.ts:527](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L527)*

___

### `Optional` evolution

• **evolution**? : *undefined | object*

*Defined in [datamine-types.ts:501](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L501)*

**`author`** BluuArc

___

###  exp_pattern

• **exp_pattern**: *number*

*Defined in [datamine-types.ts:532](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L532)*

**`description`** Defines the leveling curve. See [Unit Leveling](https://bravefrontierglobal.fandom.com/wiki/Unit_Leveling) for more information.

___

### `Optional` extra skill

• **extra skill**? : *[IExtraSkill](_datamine_types_.iextraskill.md)*

*Defined in [datamine-types.ts:533](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L533)*

___

### `Optional` feskills

• **feskills**? : *[ISpEnhancementEntry](_datamine_types_.ispenhancemententry.md)[]*

*Defined in [datamine-types.ts:538](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L538)*

**`author`** BluuArc

___

### `Optional` first_clear_missions

• **first_clear_missions**? : *string[]*

*Defined in [datamine-types.ts:521](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L521)*

**`description`** Array of mission IDs where this unit is a reward

**`author`** BluuArc

___

###  gender

• **gender**: *[UnitGender](../enums/_datamine_types_.unitgender.md)*

*Defined in [datamine-types.ts:539](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L539)*

___

###  getting type

• **getting type**: *[UnitGettingType](../enums/_datamine_types_.unitgettingtype.md)*

*Defined in [datamine-types.ts:544](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L544)*

**`description`** Helps determine merit value in exchange hall

___

###  guide_id

• **guide_id**: *number*

*Defined in [datamine-types.ts:545](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L545)*

___

### `Optional` guild_raid

• **guild_raid**? : *undefined | object*

*Defined in [datamine-types.ts:472](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L472)*

**`description`** Effects that apply only during Guild Raid

**`author`** BluuArc

___

###  id

• **id**: *number*

*Defined in [datamine-types.ts:546](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L546)*

___

###  imp

• **imp**: *object*

*Defined in [datamine-types.ts:547](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L547)*

#### Type declaration:

* **max atk**: *string*

* **max def**: *string*

* **max hp**: *string*

* **max rec**: *string*

___

###  kind

• **kind**: *[UnitKind](../enums/_datamine_types_.unitkind.md) | null*

*Defined in [datamine-types.ts:558](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L558)*

**`description`** Tells what this unit can be used for. In Deathmax's datamine, the types for
evolutions and enhancing are swapped. For example, the Fire Totem is marked as an enhancing
unit while a burst frog is marked as an evolution unit.

___

### `Optional` leader skill

• **leader skill**? : *[ILeaderSkill](_datamine_types_.ileaderskill.md)*

*Defined in [datamine-types.ts:560](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L560)*

___

###  lord damage range

• **lord damage range**: *string*

*Defined in [datamine-types.ts:565](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L565)*

**`description`** format of `minvalue~maxvalue`

___

###  movement

• **movement**: *object*

*Defined in [datamine-types.ts:567](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L567)*

#### Type declaration:

* **attack**: *[IUnitMovementEntry](_datamine_types_.iunitmovemententry.md)*

* **skill**? : *[IUnitMovementEntry](_datamine_types_.iunitmovemententry.md)*

___

###  name

• **name**: *string*

*Defined in [datamine-types.ts:571](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L571)*

___

###  overdrive stats

• **overdrive stats**: *object*

*Defined in [datamine-types.ts:572](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L572)*

#### Type declaration:

* **atk%**: *number*

* **def%**: *number*

* **rec%**: *number*

___

###  rarity

• **rarity**: *number*

*Defined in [datamine-types.ts:577](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L577)*

___

### `Optional` sbb

• **sbb**? : *[IBraveBurst](_datamine_types_.ibraveburst.md)*

*Defined in [datamine-types.ts:461](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L461)*

___

###  sell caution

• **sell caution**: *boolean*

*Defined in [datamine-types.ts:578](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L578)*

___

### `Optional` sell_price

• **sell_price**? : *undefined | number*

*Defined in [datamine-types.ts:579](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L579)*

___

### `Optional` specialEffects

• **specialEffects**? : *undefined | object*

*Defined in [datamine-types.ts:620](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L620)*

**`author`** BluuArc

___

###  stats

• **stats**: *object*

*Defined in [datamine-types.ts:580](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L580)*

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

*Defined in [datamine-types.ts:462](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L462)*
