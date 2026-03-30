import { Op, Sequelize } from "sequelize";
import {
	autoInjectable,
	RepositoryInterface,
	SearchResultInterface,
	NotFoundError,
	I18nType,
	inject,
} from "@structured-growth/microservice-sdk";
import Document, { DocumentCreationAttributes, DocumentUpdateAttributes } from "../../../database/models/document";
import { DocumentSearchParamsInterface } from "../../interfaces/document-search-params.interface";

@autoInjectable()
export class DocumentsRepository
	implements RepositoryInterface<Document, DocumentSearchParamsInterface, DocumentCreationAttributes>
{
	private i18n: I18nType;
	constructor(@inject("i18n") private getI18n: () => I18nType) {
		this.i18n = this.getI18n();
	}
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
		if (params.metadata === null) {
			where["metadata"] = { [Op.is]: null };
		} else {
			const metadataObj =
				typeof params.metadata === "string"
					? this.parseMetadata(params.metadata)
					: params.metadata && typeof params.metadata === "object" && !Array.isArray(params.metadata)
					  ? params.metadata
					  : null;

			if (metadataObj) {
				where[Op.and] = where[Op.and] ?? [];

				for (const [keyRaw, valRaw] of Object.entries(metadataObj)) {
					if (valRaw === null || valRaw === undefined) continue;

					const key = String(keyRaw).replace(/[^a-zA-Z0-9_]/g, "");
					if (!key) continue;

					const value = String(valRaw).trim();
					if (!value) continue;

					const left = Sequelize.literal(`("metadata"->>'${key}')`);

					if (value.includes("*")) {
						where[Op.and].push(Sequelize.where(left, { [Op.iLike]: value.replace(/\*/g, "%") }));
					} else {
						where[Op.and].push(Sequelize.where(left, { [Op.eq]: value }));
					}
				}
			}
		}
		params.status && (where["status"] = params.status);
		params.id && (where["id"] = { [Op.in]: params.id });
		params.date && (where["date"] = params.date);
		if (params.locale === null) {
			where["locale"] = { [Op.is]: null };
		} else if (Array.isArray(params.locale)) {
			where["locale"] = { [Op.in]: params.locale };
		}

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

	private parseMetadata(metadata: string): Record<string, unknown> | null {
		const value = metadata.trim();

		if (!value || !value.startsWith("{") || !value.endsWith("}")) {
			return null;
		}

		const parsed = JSON.parse(value);

		return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
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
			throw new NotFoundError(`${this.i18n.__("error.document.name")} ${id} ${this.i18n.__("error.common.not_found")}`);
		}
		document.setAttributes(params);

		return document.save();
	}

	public async delete(id: number): Promise<void> {
		const n = await Document.destroy({ where: { id } });

		if (n === 0) {
			throw new NotFoundError(`${this.i18n.__("error.document.name")} ${id} ${this.i18n.__("error.common.not_found")}`);
		}
	}
}
