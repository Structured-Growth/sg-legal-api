import { Op } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
	I18nType,
	inject,
} from "@structured-growth/microservice-sdk";
import Agreement, { AgreementCreationAttributes, AgreementUpdateAttributes } from "../../../database/models/agreement";
import { AgreementSearchParamsInterface } from "../../interfaces/agreement-search-params.interface";

@autoInjectable()
export class AgreementsRepository
	implements RepositoryInterface<Agreement, AgreementSearchParamsInterface, AgreementCreationAttributes>
{
	private i18n: I18nType;
	constructor(@inject("i18n") private getI18n: () => I18nType) {
		this.i18n = this.getI18n();
	}
	public async search(params: AgreementSearchParamsInterface): Promise<SearchResultInterface<Agreement>> {
		const page = params.page || 1;
		let limit = params.limit || 20;
		let offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.orgId && (where["orgId"] = params.orgId);
		params.documentId && (where["documentId"] = { [Op.in]: params.documentId });
		params.accountId && (where["accountId"] = params.accountId);
		params.userId && (where["userId"] = params.userId);
		params.status && (where["status"] = params.status);
		params.id && (where["id"] = { [Op.in]: params.id });
		params.date && (where["date"] = params.date);

		const { rows, count } = await Agreement.findAndCountAll({
			where,
			offset,
			limit,
			order,
		});

		return {
			data: rows,
			total: count,
			limit,
			page,
		};
	}

	public async create(params: AgreementCreationAttributes): Promise<Agreement> {
		return Agreement.create(params);
	}

	public async read(
		id: number,
		params?: {
			attributes?: string[];
		}
	): Promise<Agreement> {
		return Agreement.findByPk(id, {
			attributes: params?.attributes,
			rejectOnEmpty: false,
		});
	}

	public async update(id: number, params: AgreementUpdateAttributes): Promise<Agreement> {
		const document = await this.read(id);
		if (!document) {
			throw new NotFoundError(
				`${this.i18n.__("error.agreement.name")} ${id} ${this.i18n.__("error.common.not_found")}`
			);
		}
		document.setAttributes(params);

		return document.save();
	}

	public async delete(id: number): Promise<void> {
		const n = await Agreement.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(
				`${this.i18n.__("error.agreement.name")} ${id} ${this.i18n.__("error.common.not_found")}`
			);
		}
	}
}
