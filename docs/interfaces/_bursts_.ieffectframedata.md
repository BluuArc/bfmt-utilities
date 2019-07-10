> ## [bfmt-utilities](../README.md)

[Globals](../globals.md) / ["bursts"](../modules/_bursts_.md) / [IEffectFrameData](_bursts_.ieffectframedata.md) /

# Interface: IEffectFrameData

Combined object containing the damage frame and effect of an effect entry in a Brave Burst

## Hierarchy

* **IEffectFrameData**

### Index

#### Properties

* [damageFramesEntry](_bursts_.ieffectframedata.md#damageframesentry)
* [delay](_bursts_.ieffectframedata.md#delay)
* [effect](_bursts_.ieffectframedata.md#effect)
* [id](_bursts_.ieffectframedata.md#id)
* [target](_bursts_.ieffectframedata.md#target)

## Properties

###  damageFramesEntry

● **damageFramesEntry**: *[BurstDamageFramesEntry](../modules/_datamine_types_d_.md#burstdamageframesentry)*

*Defined in [bursts.ts:90](https://github.com/BluuArc/bfmt-utilities/blob/c9b209e/src/bursts.ts#L90)*

the damage frames for a given effect

___

###  delay

● **delay**: *string*

*Defined in [bursts.ts:95](https://github.com/BluuArc/bfmt-utilities/blob/c9b209e/src/bursts.ts#L95)*

the time/frame delay of a given effect

___

###  effect

● **effect**: *[ProcEffect](../modules/_datamine_types_d_.md#proceffect) | [UnknownProcEffect](../modules/_datamine_types_d_.md#unknownproceffect)*

*Defined in [bursts.ts:100](https://github.com/BluuArc/bfmt-utilities/blob/c9b209e/src/bursts.ts#L100)*

the parameters for a given effect

___

###  id

● **id**: *string*

*Defined in [bursts.ts:105](https://github.com/BluuArc/bfmt-utilities/blob/c9b209e/src/bursts.ts#L105)*

the proc id of a given effect

___

###  target

● **target**: *[TARGET_AREA_MAPPING](../enums/_constants_.target_area_mapping.md)*

*Defined in [bursts.ts:110](https://github.com/BluuArc/bfmt-utilities/blob/c9b209e/src/bursts.ts#L110)*

the target area of a given effect

___