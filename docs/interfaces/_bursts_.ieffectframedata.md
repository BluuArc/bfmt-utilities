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

*Defined in [bursts.ts:89](https://github.com/BluuArc/bfmt-utilities/blob/1179835/src/bursts.ts#L89)*

the damage frames for a given effect

___

###  delay

● **delay**: *string*

*Defined in [bursts.ts:94](https://github.com/BluuArc/bfmt-utilities/blob/1179835/src/bursts.ts#L94)*

the time/frame delay of a given effect

___

###  effect

● **effect**: *[ProcEffect](../modules/_datamine_types_d_.md#proceffect) | [UnknownProcEffect](../modules/_datamine_types_d_.md#unknownproceffect)*

*Defined in [bursts.ts:99](https://github.com/BluuArc/bfmt-utilities/blob/1179835/src/bursts.ts#L99)*

the parameters for a given effect

___

###  id

● **id**: *string*

*Defined in [bursts.ts:104](https://github.com/BluuArc/bfmt-utilities/blob/1179835/src/bursts.ts#L104)*

the proc id of a given effect

___

###  target

● **target**: *[TARGET_AREA_MAPPING](../enums/_constants_.target_area_mapping.md)*

*Defined in [bursts.ts:109](https://github.com/BluuArc/bfmt-utilities/blob/1179835/src/bursts.ts#L109)*

the target area of a given effect

___