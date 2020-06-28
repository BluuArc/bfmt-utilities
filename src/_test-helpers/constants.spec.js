const buffMetadata = require('../buffs/buff-metadata');
const testConstants = require('./constants');

describe('test setup', () => {
	// testing the arbitrary variables to ensure validity of test inputs since it is all based on the generated buff metadata
	it('has a valid attacking proc id for KNOWN_ARBITRARY_ATTACKING_PROC_ID', () => {
		const metadataEntry = buffMetadata.PROC_METADATA[testConstants.KNOWN_ARBITRARY_ATTACKING_PROC_ID];
		expect(metadataEntry)
			.withContext(`No metadata entry found for test proc id ${testConstants.KNOWN_ARBITRARY_ATTACKING_PROC_ID}`)
			.toBeTruthy();
		expect(metadataEntry.Type)
			.withContext(`No type found for test proc id ${testConstants.KNOWN_ARBITRARY_ATTACKING_PROC_ID}`)
			.toBeTruthy();
		expect(metadataEntry.Type)
			.withContext(`Test Proc ID ${testConstants.KNOWN_ARBITRARY_ATTACKING_PROC_ID} is not type ${buffMetadata.ProcBuffType.Attack}`)
			.toBe(buffMetadata.ProcBuffType.Attack);
	});

	it('has a valid non-attacking proc id for KNOWN_ARBITRARY_NON_ATTACKING_PROC_ID', () => {
		const metadataEntry = buffMetadata.PROC_METADATA[testConstants.KNOWN_ARBITRARY_NON_ATTACKING_PROC_ID];
		expect(metadataEntry)
			.withContext(`No metadata entry found for test proc id ${testConstants.KNOWN_ARBITRARY_NON_ATTACKING_PROC_ID}`)
			.toBeTruthy();
		expect(metadataEntry.Type)
			.withContext(`No type found for test proc id ${testConstants.KNOWN_ARBITRARY_NON_ATTACKING_PROC_ID}`)
			.toBeDefined();
		expect(metadataEntry.Type)
			.withContext(`Test Proc ID ${testConstants.KNOWN_ARBITRARY_NON_ATTACKING_PROC_ID} should not be type ${buffMetadata.ProcBuffType.Attack}`)
			.not.toBe(buffMetadata.ProcBuffType.Attack);
	});

	it('has an invalid proc id for ARBITRARY_INVALID_PROC_ID', () => {
		const metadataEntry = buffMetadata.PROC_METADATA[testConstants.ARBITRARY_INVALID_PROC_ID];
		expect(metadataEntry)
			.withContext(`No metadata entry should be found for test proc id ${testConstants.ARBITRARY_INVALID_PROC_ID}`)
			.toBeUndefined();
	});

	it('has a valid passive id for KNOWN_ARBITRARY_PASSIVE_ID', () => {
		const metadataEntry = buffMetadata.PASSIVE_METADATA[testConstants.KNOWN_ARBITRARY_PASSIVE_ID];
		expect(metadataEntry)
			.withContext(`No metadata entry found for test passive id ${testConstants.KNOWN_ARBITRARY_PASSIVE_ID}`)
			.toBeTruthy();
	});

	it('has an invalid passive id for ARBITRARY_INVALID_PASSIVE_ID', () => {
		const metadataEntry = buffMetadata.PROC_METADATA[testConstants.ARBITRARY_INVALID_PASSIVE_ID];
		expect(metadataEntry)
			.withContext(`No metadata entry should be found for test passive id ${testConstants.ARBITRARY_INVALID_PASSIVE_ID}`)
			.toBeUndefined();
	});
});
