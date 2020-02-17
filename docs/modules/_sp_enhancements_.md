[@bluuarc/bfmt-utilities](../README.md) › [Globals](../globals.md) › ["sp-enhancements"](_sp_enhancements_.md)

# External module: "sp-enhancements"

## Index

### Functions

* [getEffectsForSpEnhancement](_sp_enhancements_.md#geteffectsforspenhancement)
* [getSpCategoryName](_sp_enhancements_.md#getspcategoryname)

## Functions

###  getEffectsForSpEnhancement

▸ **getEffectsForSpEnhancement**(`entry`: [ISpEnhancementEntry](../interfaces/_datamine_types_.ispenhancemententry.md)): *[SpEnhancementEffect](_datamine_types_.md#spenhancementeffect)[]*

*Defined in [sp-enhancements.ts:14](https://github.com/BluuArc/bfmt-utilities/blob/master/src/sp-enhancements.ts#L14)*

**`description`** Get the effects of a given SP Enhancement Entry

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`entry` | [ISpEnhancementEntry](../interfaces/_datamine_types_.ispenhancemententry.md) | SP Enhancement Entry to get the effects of |

**Returns:** *[SpEnhancementEffect](_datamine_types_.md#spenhancementeffect)[]*

the effects of the given SP Enhancement Entry if they exist, an empty array otherwise

___

###  getSpCategoryName

▸ **getSpCategoryName**(`categoryId`: string | number): *[SpCategoryName](../enums/_datamine_types_.spcategoryname.md)*

*Defined in [sp-enhancements.ts:37](https://github.com/BluuArc/bfmt-utilities/blob/master/src/sp-enhancements.ts#L37)*

**`description`** Get the associated category name with a given category ID.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`categoryId` | string &#124; number | Category ID to get the name of |

**Returns:** *[SpCategoryName](../enums/_datamine_types_.spcategoryname.md)*

The name of the given category ID or the string 'Unknown'.
