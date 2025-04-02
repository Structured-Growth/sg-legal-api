"use strict";

const Sequelize = require("sequelize");

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		await queryInterface.sequelize.query(`
        ALTER TABLE "${process.env.DB_SCHEMA}"."documents"
        DROP CONSTRAINT IF EXISTS "documents_code_key";
		`);

		await queryInterface.changeColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "documents",
			},
			"code",
			{
				type: Sequelize.STRING(100),
				allowNull: false,
			}
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

	async down(queryInterface, Sequelize) {
		await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS "${process.env.DB_SCHEMA}"."documents_code_version_unique";
    `);

		await queryInterface.changeColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "documents",
			},
			"code",
			{
				type: Sequelize.STRING(100),
				allowNull: false,
				unique: true,
			}
		);
	},
};
