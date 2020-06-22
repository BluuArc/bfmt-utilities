[@bluuarc/bfmt-utilities - v0.6.0](../README.md) › [Globals](../globals.md) › ["units/getUnitImageFileNames"](_units_getunitimagefilenames_.md)

# Module: "units/getUnitImageFileNames"

## Index

### Functions

* [getUnitImageFileNames](_units_getunitimagefilenames_.md#getunitimagefilenames)

## Functions

###  getUnitImageFileNames

▸ **getUnitImageFileNames**(`id`: string, `suffix`: string): *[IUnitImageFileNames](../interfaces/_units_iunitimagefilenames_.iunitimagefilenames.md)*

*Defined in [units/getUnitImageFileNames.ts:9](https://github.com/BluuArc/bfmt-utilities/blob/master/src/units/getUnitImageFileNames.ts#L9)*

**`description`** Generate the file names for each of the image type for a given unit ID

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`id` | string | - | the unit ID to use to generate the file names |
`suffix` | string | "" | optional parameter that's useful for things like alternate art |

**Returns:** *[IUnitImageFileNames](../interfaces/_units_iunitimagefilenames_.iunitimagefilenames.md)*

set of file names for each image type (spritesheet, battle avatar, guide avatar, full illustration)
