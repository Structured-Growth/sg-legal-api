"use strict";

const Sequelize = require("sequelize");

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		await queryInterface.addColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "documents",
			},
			"locale",
			{
				type: Sequelize.STRING,
				allowNull: true,
			}
		);

		await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "${process.env.DB_SCHEMA}"."documents_code_version_unique";
    `);

		await queryInterface.addIndex(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "documents",
			},
			{
				type: "UNIQUE",
				fields: ["code", "version", "org_id", "locale"],
				name: "documents_code_version_org_locale_unique",
			}
		);
	},

	async down(queryInterface) {
		await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "${process.env.DB_SCHEMA}"."documents_code_version_org_locale_unique";
    `);

		await queryInterface.removeColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "documents",
			},
			"locale"
		);

		await queryInterface.addIndex(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "documents",
			},
			{
				type: "UNIQUE",
				fields: ["code", "version"],
				name: "documents_code_version_unique",
			}
		);
	},
};
