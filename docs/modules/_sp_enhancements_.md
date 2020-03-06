[@bluuarc/bfmt-utilities - v0.4.0](../README.md) › [Globals](../globals.md) › ["sp-enhancements"](_sp_enhancements_.md)

# External module: "sp-enhancements"

## Index

### Functions

* [getEffectsForSpEnhancement](_sp_enhancements_.md#geteffectsforspenhancement)
* [getSpCategoryName](_sp_enhancements_.md#getspcategoryname)
* [spCodeToIndex](_sp_enhancements_.md#spcodetoindex)
* [spIndexToCode](_sp_enhancements_.md#spindextocode)

## Functions

###  getEffectsForSpEnhancement

▸ **getEffectsForSpEnhancement**(`entry`: [ISpEnhancementEntry](../interfaces/_datamine_types_.ispenhancemententry.md)): *[SpEnhancementEffect](_datamine_types_.md#spenhancementeffect)[]*

*Defined in [sp-enhancements.ts:27](https://github.com/BluuArc/bfmt-utilities/blob/master/src/sp-enhancements.ts#L27)*

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

*Defined in [sp-enhancements.ts:50](https://github.com/BluuArc/bfmt-utilities/blob/master/src/sp-enhancements.ts#L50)*

**`description`** Get the associated category name with a given category ID.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`categoryId` | string &#124; number | Category ID to get the name of |

**Returns:** *[SpCategoryName](../enums/_datamine_types_.spcategoryname.md)*

The name of the given category ID or the string 'Unknown'.

___

###  spCodeToIndex

▸ **spCodeToIndex**(`code`: string): *number*

*Defined in [sp-enhancements.ts:104](https://github.com/BluuArc/bfmt-utilities/blob/master/src/sp-enhancements.ts#L104)*

**`description`** Get the corresponding index for a given character code.
It expects an alphanumeric character and will return -1 otherwise.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`code` | string | Character code an SP entry in a given skills array |

**Returns:** *number*

The corresponding index to the given character or -1 if the
character is invalid.

___

###  spIndexToCode

▸ **spIndexToCode**(`index`: number): *string*

*Defined in [sp-enhancements.ts:78](https://github.com/BluuArc/bfmt-utilities/blob/master/src/sp-enhancements.ts#L78)*

**`description`** Get the corresponding character code for a given index.
It expects an index between 0 and 61 inclusive; will return an empty string if
the given value is outside of the range.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`index` | number | Index of an SP entry in a given skills array |

**Returns:** *string*

The corresponding single alphanumeric character to the given index
or an empty string if the index is invalid.
