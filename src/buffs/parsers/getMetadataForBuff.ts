import { BuffId } from './buff-types';
import { IBuffMetadata, BUFF_METADATA } from './buff-metadata';

/**
 * @description Get the associated metadata entry for a given buff ID.
 * @param id Buff ID to get metadata for.
 * @returns Corresponding buff metadata entry if it exists, undefined otherwise.
 */
export default function getMetadataForBuff (id: BuffId, metadata: { [id: string] : IBuffMetadata } = BUFF_METADATA): IBuffMetadata | undefined {
	return (!!metadata && typeof metadata === 'object') && Object.hasOwnProperty.call(metadata, id)
		? metadata[id]
		: (void 0);
}
