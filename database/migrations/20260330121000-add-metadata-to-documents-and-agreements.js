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
			"metadata",
			{
				type: Sequelize.JSONB,
				allowNull: true,
			}
		);

		await queryInterface.addColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "agreements",
			},
			"metadata",
			{
				type: Sequelize.JSONB,
				allowNull: true,
			}
		);
	},

	async down(queryInterface) {
		await queryInterface.removeColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "agreements",
			},
			"metadata"
		);

		await queryInterface.removeColumn(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "documents",
			},
			"metadata"
		);
	},
};
