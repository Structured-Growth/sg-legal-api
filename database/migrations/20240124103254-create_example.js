"use strict";

const Sequelize = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface) {
		await queryInterface.createTable(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "example",
			},
			{
				id: {
					type: Sequelize.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				account_id: Sequelize.INTEGER,
				org_id: Sequelize.INTEGER,
				region: Sequelize.STRING(10),
				status: Sequelize.STRING(10),
				created_at: Sequelize.DATE,
				updated_at: Sequelize.DATE,
				deleted_at: Sequelize.DATE,
			}
		);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable({
			schema: process.env.DB_SCHEMA,
			tableName: "example",
		});
	},
};
