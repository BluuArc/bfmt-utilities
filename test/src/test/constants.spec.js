const buffMetadata = require('../../../src/buff-metadata');
const testConstants = require('../../helpers/constants');

describe('test setup', () => {
	// testing the arbitrary variables to ensure validity of test inputs since it is all based on the generated buff metadata
	it('has an attacking proc id for ARBITRARY_ATTACKING_PROC_ID', () => {
		const metadataEntry = buffMetadata.PROC_METADATA[testConstants.ARBITRARY_ATTACKING_PROC_ID];
		expect(metadataEntry).toBeTruthy(`No metadata entry found for proc id ${testConstants.ARBITRARY_ATTACKING_PROC_ID}`);
		expect(metadataEntry.Type).toBeTruthy(`No type found for proc id ${testConstants.ARBITRARY_ATTACKING_PROC_ID}`);
		expect(metadataEntry.Type).toBe(buffMetadata.ProcBuffType.Attack, `Proc ID ${testConstants.ARBITRARY_ATTACKING_PROC_ID} is not type ${buffMetadata.ProcBuffType.Attack}`);
	});

	it('has an non-attacking proc id for ARBITRARY_NON_ATTACKING_PROC_ID', () => {
		const metadataEntry = buffMetadata.PROC_METADATA[testConstants.ARBITRARY_NON_ATTACKING_PROC_ID];
		expect(metadataEntry).toBeTruthy(`No metadata entry found for proc id ${testConstants.ARBITRARY_NON_ATTACKING_PROC_ID}`);
		expect(metadataEntry.Type).toBeDefined(`No type found for proc id ${testConstants.ARBITRARY_NON_ATTACKING_PROC_ID}`);
		expect(metadataEntry.Type).not.toBe(buffMetadata.ProcBuffType.Attack, `Proc ID ${testConstants.ARBITRARY_NON_ATTACKING_PROC_ID} should not be type ${buffMetadata.ProcBuffType.Attack}`);
	});

	it('has an invalid proc id for ARBITRARY_INVALID_PROC_ID', () => {
		const metadataEntry = buffMetadata.PROC_METADATA[testConstants.ARBITRARY_INVALID_PROC_ID];
		expect(metadataEntry).toBeUndefined(`No metadata entry should be found for proc id ${testConstants.ARBITRARY_INVALID_PROC_ID}`);
	});
});
