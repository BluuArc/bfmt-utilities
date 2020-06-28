export { default as getMetadataForProc } from './getMetadataForProc';
export { default as getMetadataForPassive } from './getMetadataForPassive';
export { default as isAttackingProcId } from './isAttackingProcId';
export { default as getNameForProc } from './getNameForProc';
export { default as getNameForPassive } from './getNameForPassive';
export { default as isProcEffect } from './isProcEffect';
export { default as isPassiveEffect } from './isPassiveEffect';
export type { default as IProcEffectFrameComposite } from './IProcEffectFrameComposite';
export { default as combineEffectsAndDamageFrames } from './combineEffectsAndDamageFrames';
export { default as getEffectId } from './getEffectId';
export { default as getEffectName } from './getEffectName';
export type { IPassiveMetadataEntry, IProcMetadataEntry } from './buff-metadata';
export { ProcBuffType, PASSIVE_METADATA, PROC_METADATA } from './buff-metadata';
export * as constants from './constants';

// exports from parsers
export { default as convertProcEffectToBuff }  from './parsers/convertProcEffectToBuff';
export { BuffSource, BuffStackType } from './parsers/buff-types';
export type { IBuff, IUnitState, IEffectToBuffConversionContext } from './parsers/buff-types';
