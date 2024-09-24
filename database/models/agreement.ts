import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from "sequelize-typescript";
import { container, RegionEnum, DefaultModelInterface } from "@structured-growth/microservice-sdk";
import Document from "./document";

export interface AgreementAttributes extends DefaultModelInterface {
	documentId: number;
	userId: number;
	date: Date | any;
	status: "active" | "inactive" | "archived";
}

export interface AgreementCreationAttributes
	extends Omit<AgreementAttributes, "id" | "arn" | "createdAt" | "updatedAt" | "deletedAt"> {}

export interface AgreementUpdateAttributes extends Partial<Pick<AgreementCreationAttributes, "status" | "date">> {}

@Table({
	tableName: "agreements",
	timestamps: true,
	underscored: true,
	paranoid: true,
})
export class Agreement extends Model<AgreementAttributes, AgreementCreationAttributes> implements AgreementAttributes {
	@Column
	orgId: number;

	@Column(DataType.STRING)
	region: RegionEnum;

	@Column
	accountId: number;

	@Column
	@ForeignKey(() => Document)
	documentId: number;

	@BelongsTo(() => Document)
	document: Document;

	@Column
	userId: number;

	@Column(DataType.STRING)
	status: AgreementAttributes["status"];

	@Column({
		type: DataType.DATE,
	})
	date: Date;

	static get arnPattern(): string {
		return [container.resolve("appPrefix"), "<region>", "<orgId>", "<accountId>", "agreements/<agreementId>"].join(":");
	}

	get arn(): string {
		return [container.resolve("appPrefix"), this.region, this.orgId, this.accountId, `agreements/${this.id}`].join(":");
	}
}

export default Agreement;
