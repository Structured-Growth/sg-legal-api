"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		const schema = process.env.DB_SCHEMA;

		await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "${schema}"."documents_code_version_org_locale_unique";
    `);

		await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX documents_code_version_org_locale_unique_active
      ON "${schema}"."documents" (code, version, org_id, locale)
      WHERE deleted_at IS NULL;
    `);
	},

	async down(queryInterface) {
		const schema = process.env.DB_SCHEMA;

		await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "${schema}"."documents_code_version_org_locale_unique_active";
    `);

		await queryInterface.addIndex(
			{
				schema,
				tableName: "documents",
			},
			{
				type: "UNIQUE",
				fields: ["code", "version", "org_id", "locale"],
				name: "documents_code_version_org_locale_unique",
			}
		);
	},
};
