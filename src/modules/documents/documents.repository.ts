import { Op } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
} from "@structured-growth/microservice-sdk";
import Document, { DocumentCreationAttributes, DocumentUpdateAttributes } from "../../../database/models/document";
import { DocumentSearchParamsInterface } from "../../interfaces/document-search-params.interface";

@autoInjectable()
export class DocumentsRepository
	implements RepositoryInterface<Document, DocumentSearchParamsInterface, DocumentCreationAttributes>
{
	public async search(params: DocumentSearchParamsInterface): Promise<SearchResultInterface<Document>> {
		const page = params.page || 1;
		let limit = params.limit || 20;
		let offset = (page - 1) * limit;
		const where = {};
		const order = params.sort ? (params.sort.map((item) => item.split(":")) as any) : [["createdAt", "desc"]];

		params.orgId && (where["orgId"] = params.orgId);
		params.title &&
			(where["title"] = {
				[Op.iLike]: params.title.replace(/\*/g, "%"),
			});
		params.code && (where["code"] = params.code);
		params.version && (where["version"] = params.version);
		params.status && (where["status"] = params.status);
		params.id && (where["id"] = { [Op.in]: params.id });
		params.date && (where["date"] = params.date);

		const { rows, count } = await Document.findAndCountAll({
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

	public async create(params: DocumentCreationAttributes): Promise<Document> {
		return Document.create(params);
	}

	public async read(
		id: number,
		params?: {
			attributes?: string[];
		}
	): Promise<Document> {
		return Document.findByPk(id, {
			attributes: params?.attributes,
			rejectOnEmpty: false,
		});
	}

	public async update(id: number, params: DocumentUpdateAttributes): Promise<Document> {
		const document = await this.read(id);
		if (!document) {
			throw new NotFoundError(`Document ${id} not found`);
		}
		document.setAttributes(params);

		return document.save();
	}

	public async delete(id: number): Promise<void> {
		const n = await Document.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(`Document ${id} not found`);
		}
	}
}
