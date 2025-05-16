import { Column, DataType, Model, Table } from "sequelize-typescript";
import { container, RegionEnum, DefaultModelInterface } from "@structured-growth/microservice-sdk";

export interface DocumentAttributes extends Omit<DefaultModelInterface, "accountId"> {
	title: string;
	code: string;
	text: string;
	version: number;
	locale?: string | null;
	date: Date | any;
	status: "active" | "inactive" | "archived";
}

export interface DocumentCreationAttributes
	extends Omit<DocumentAttributes, "id" | "arn" | "createdAt" | "updatedAt" | "deletedAt"> {}

export interface DocumentUpdateAttributes
	extends Partial<
		Pick<DocumentCreationAttributes, "status" | "title" | "code" | "text" | "version" | "locale" | "date">
	> {}

@Table({
	tableName: "documents",
	timestamps: true,
	underscored: true,
	paranoid: true,
})
export class Document extends Model<DocumentAttributes, DocumentCreationAttributes> implements DocumentAttributes {
	@Column
	orgId: number;

	@Column(DataType.STRING)
	region: RegionEnum;

	@Column
	title: string;

	@Column
	code: string;

	@Column(DataType.TEXT)
	text: string;

	@Column
	version: number;

	@Column(DataType.STRING)
	locale: string | null;

	@Column(DataType.STRING)
	status: DocumentAttributes["status"];

	@Column({
		type: DataType.DATE,
	})
	date: Date;

	static get arnPattern(): string {
		return [container.resolve("appPrefix"), "<region>", "<orgId>", "<accountId>", "documents/<documentId>"].join(":");
	}

	get arn(): string {
		return [container.resolve("appPrefix"), this.region, this.orgId, "*", `documents/${this.id}`].join(":");
	}
}

export default Document;
