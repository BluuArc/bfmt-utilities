[@bluuarc/bfmt-utilities - v0.6.0](../README.md) › [Globals](../globals.md) › ["datamine-types"](../modules/_datamine_types_.md) › [ISphere](_datamine_types_.isphere.md)

# Interface: ISphere

## Hierarchy

* [IItem](_datamine_types_.iitem.md)

  ↳ **ISphere**

## Index

### Properties

* [associated_elgifs](_datamine_types_.isphere.md#optional-associated_elgifs)
* [associated_units](_datamine_types_.isphere.md#optional-associated_units)
* [bfmtMetadata](_datamine_types_.isphere.md#optional-bfmtmetadata)
* [desc](_datamine_types_.isphere.md#desc)
* [effect](_datamine_types_.isphere.md#effect)
* [first_clear_missions](_datamine_types_.isphere.md#optional-first_clear_missions)
* [id](_datamine_types_.isphere.md#id)
* [lore](_datamine_types_.isphere.md#optional-lore)
* [max_stack](_datamine_types_.isphere.md#max_stack)
* [name](_datamine_types_.isphere.md#name)
* [raid](_datamine_types_.isphere.md#raid)
* [rarity](_datamine_types_.isphere.md#rarity)
* [recipe](_datamine_types_.isphere.md#optional-recipe)
* [sell caution](_datamine_types_.isphere.md#optional-sell-caution)
* [sell_price](_datamine_types_.isphere.md#sell_price)
* [sphere type](_datamine_types_.isphere.md#sphere-type)
* [sphere type text](_datamine_types_.isphere.md#optional-sphere-type-text)
* [thumbnail](_datamine_types_.isphere.md#thumbnail)
* [type](_datamine_types_.isphere.md#type)
* [usage](_datamine_types_.isphere.md#optional-usage)

## Properties

### `Optional` associated_elgifs

• **associated_elgifs**? : *string[]*

*Inherited from [IItem](_datamine_types_.iitem.md).[associated_elgifs](_datamine_types_.iitem.md#optional-associated_elgifs)*

*Defined in [datamine-types.ts:716](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L716)*

**`description`** Array of extra skill IDs that have the current item as a condition for at least one effect.

**`author`** BluuArc

___

### `Optional` associated_units

• **associated_units**? : *string[]*

*Inherited from [IItem](_datamine_types_.iitem.md).[associated_units](_datamine_types_.iitem.md#optional-associated_units)*

*Defined in [datamine-types.ts:702](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L702)*

**`description`** List of units that use this item

**`author`** BluuArc

___

### `Optional` bfmtMetadata

• **bfmtMetadata**? : *[IBfmtMetadata](_datamine_types_.ibfmtmetadata.md)*

*Inherited from [IItem](_datamine_types_.iitem.md).[bfmtMetadata](_datamine_types_.iitem.md#optional-bfmtmetadata)*

*Defined in [datamine-types.ts:671](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L671)*

**`author`** BluuArc

___

###  desc

• **desc**: *string*

*Inherited from [IItem](_datamine_types_.iitem.md).[desc](_datamine_types_.iitem.md#desc)*

*Defined in [datamine-types.ts:673](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L673)*

___

###  effect

• **effect**: *[PassiveEffect](../modules/_datamine_types_.md#passiveeffect)[]*

*Defined in [datamine-types.ts:729](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L729)*

___

### `Optional` first_clear_missions

• **first_clear_missions**? : *string[]*

*Inherited from [IItem](_datamine_types_.iitem.md).[first_clear_missions](_datamine_types_.iitem.md#optional-first_clear_missions)*

*Defined in [datamine-types.ts:708](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L708)*

**`description`** Array of mission IDs where this item is a reward

**`author`** BluuArc

___

###  id

• **id**: *number*

*Inherited from [IItem](_datamine_types_.iitem.md).[id](_datamine_types_.iitem.md#id)*

*Defined in [datamine-types.ts:674](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L674)*

___

### `Optional` lore

• **lore**? : *undefined | string*

*Inherited from [IItem](_datamine_types_.iitem.md).[lore](_datamine_types_.iitem.md#optional-lore)*

*Defined in [datamine-types.ts:696](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L696)*

**`author`** BluuArc

___

###  max_stack

• **max_stack**: *number*

*Inherited from [IItem](_datamine_types_.iitem.md).[max_stack](_datamine_types_.iitem.md#max_stack)*

*Defined in [datamine-types.ts:675](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L675)*

___

###  name

• **name**: *string*

*Inherited from [IItem](_datamine_types_.iitem.md).[name](_datamine_types_.iitem.md#name)*

*Defined in [datamine-types.ts:676](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L676)*

___

###  raid

• **raid**: *boolean*

*Inherited from [IItem](_datamine_types_.iitem.md).[raid](_datamine_types_.iitem.md#raid)*

*Defined in [datamine-types.ts:677](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L677)*

___

###  rarity

• **rarity**: *number*

*Inherited from [IItem](_datamine_types_.iitem.md).[rarity](_datamine_types_.iitem.md#rarity)*

*Defined in [datamine-types.ts:678](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L678)*

___

### `Optional` recipe

• **recipe**? : *[IItemRecipe](_datamine_types_.iitemrecipe.md) | [IItemRecipe](_datamine_types_.iitemrecipe.md)[]*

*Inherited from [IItem](_datamine_types_.iitem.md).[recipe](_datamine_types_.iitem.md#optional-recipe)*

*Defined in [datamine-types.ts:685](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L685)*

**`description`** If the source is from Deathmax, then it is an object. If the source is from BluuArc, then it is an array.

___

### `Optional` sell caution

• **sell caution**? : *undefined | false | true*

*Inherited from [IItem](_datamine_types_.iitem.md).[sell caution](_datamine_types_.iitem.md#optional-sell-caution)*

*Defined in [datamine-types.ts:710](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L710)*

___

###  sell_price

• **sell_price**: *number*

*Inherited from [IItem](_datamine_types_.iitem.md).[sell_price](_datamine_types_.iitem.md#sell_price)*

*Defined in [datamine-types.ts:679](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L679)*

___

###  sphere type

• **sphere type**: *[SphereTypeId](../enums/_datamine_types_.spheretypeid.md)*

*Defined in [datamine-types.ts:730](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L730)*

___

### `Optional` sphere type text

• **sphere type text**? : *[SphereTypeName](../enums/_datamine_types_.spheretypename.md)*

*Defined in [datamine-types.ts:731](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L731)*

___

###  thumbnail

• **thumbnail**: *string*

*Inherited from [IItem](_datamine_types_.iitem.md).[thumbnail](_datamine_types_.iitem.md#thumbnail)*

*Defined in [datamine-types.ts:680](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L680)*

___

###  type

• **type**: *[ItemType](../enums/_datamine_types_.itemtype.md)*

*Inherited from [IItem](_datamine_types_.iitem.md).[type](_datamine_types_.iitem.md#type)*

*Defined in [datamine-types.ts:681](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L681)*

___

### `Optional` usage

• **usage**? : *[IItemUsageEntry](_datamine_types_.iitemusageentry.md)[]*

*Inherited from [IItem](_datamine_types_.iitem.md).[usage](_datamine_types_.iitem.md#optional-usage)*

*Defined in [datamine-types.ts:691](https://github.com/BluuArc/bfmt-utilities/blob/master/src/datamine-types.ts#L691)*

**`description`** List of other items that use the current item in their recipe

**`author`** BluuArc
