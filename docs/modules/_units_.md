[@bluuarc/bfmt-utilities](../README.md) › [Globals](../globals.md) › ["units"](_units_.md)

# External module: "units"

## Index

### Interfaces

* [IUnitImageFileNames](../interfaces/_units_.iunitimagefilenames.md)

### Functions

* [getUnitImageFileNames](_units_.md#getunitimagefilenames)
* [getUnitImageUrl](_units_.md#getunitimageurl)

## Functions

###  getUnitImageFileNames

▸ **getUnitImageFileNames**(`id`: string, `suffix`: string): *[IUnitImageFileNames](../interfaces/_units_.iunitimagefilenames.md)*

*Defined in [units.ts:13](https://github.com/BluuArc/bfmt-utilities/blob/71cd4d1/src/units.ts#L13)*

**`description`** Generate the file names for each of the image type for a given unit ID

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`id` | string | - | the unit ID to use to generate the file names |
`suffix` | string | "" | optional parameter that's useful for things like alternate art  |

**Returns:** *[IUnitImageFileNames](../interfaces/_units_.iunitimagefilenames.md)*

___

###  getUnitImageUrl

▸ **getUnitImageUrl**(`baseContentUrl`: string, `fileName`: string): *string*

*Defined in [units.ts:28](https://github.com/BluuArc/bfmt-utilities/blob/71cd4d1/src/units.ts#L28)*

**`description`** Generate a URL to display the image with the given unit filename

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`baseContentUrl` | string | Base URL of the server |
`fileName` | string | name of the file that represents an image for a given unit  |

**Returns:** *string*
