"use strict";

const Sequelize = require("sequelize");

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		await queryInterface.createTable(
			{
				schema: process.env.DB_SCHEMA,
				tableName: "documents",
			},
			{
				id: {
					type: Sequelize.INTEGER,
					primaryKey: true,
					autoIncrement: true,
				},
				org_id: {
					type: Sequelize.INTEGER,
					allowNull: false,
				},
				region: {
					type: Sequelize.STRING(10),
					allowNull: false,
				},
				title: {
					type: Sequelize.STRING(100),
					allowNull: false,
				},
				code: {
					type: Sequelize.STRING(100),
					allowNull: false,
					unique: true,
				},
				text: {
					type: Sequelize.TEXT,
					allowNull: false,
				},
				version: {
					type: Sequelize.SMALLINT,
					allowNull: false,
				},
				status: {
					type: Sequelize.STRING(15),
					allowNull: false,
				},
				date: {
					type: Sequelize.DATE,
					allowNull: false,
				},
				created_at: Sequelize.DATE,
				updated_at: Sequelize.DATE,
				deleted_at: Sequelize.DATE,
			}
		);
	},

	async down(queryInterface) {
		await queryInterface.dropTable({
			schema: process.env.DB_SCHEMA,
			tableName: "documents",
		});
	},
};
