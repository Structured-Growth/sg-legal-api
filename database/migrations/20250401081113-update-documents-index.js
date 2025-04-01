"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
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
		await queryInterface.removeIndex(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "documents",
			},
			"documents_code_version_unique"
		);

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
