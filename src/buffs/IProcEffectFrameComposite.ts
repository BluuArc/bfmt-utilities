import {
	ProcEffect,
	IDamageFramesEntry,
	TargetArea,
	TargetType,
} from '../datamine-types';

export default interface IProcEffectFrameComposite {
	delay: string;
	effect: ProcEffect;
	frames: IDamageFramesEntry;
	id: string;
	targetArea: TargetArea;
	targetType: TargetType;
} // eslint-disable-line semi
