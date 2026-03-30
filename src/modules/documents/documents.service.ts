import { autoInjectable, inject, ValidationError, I18nType, NotFoundError } from "@structured-growth/microservice-sdk";
import { DocumentsRepository } from "./documents.repository";
import Document, { DocumentCreationAttributes, DocumentUpdateAttributes } from "../../../database/models/document";
import { CustomFieldService } from "../custom-fields/custom-field.service";

@autoInjectable()
export class DocumentsService {
	private i18n: I18nType;
	constructor(
		@inject("DocumentsRepository") private documentRepository: DocumentsRepository,
		@inject("CustomFieldService") private customFieldService: CustomFieldService,
		@inject("i18n") private getI18n: () => I18nType
	) {
		this.i18n = this.getI18n();
	}

	public async create(params: DocumentCreationAttributes, inheritedOrgIds: number[] = []): Promise<Document> {
		const document = await this.documentRepository.search({
			code: params.code,
			version: params.version,
			orgId: params.orgId,
			locale: [params.locale ?? null],
		});

		if (document.data.length > 0) {
			throw new ValidationError({
				documentId: [this.i18n.__("error.document.document_created")],
			});
		}

		await this.customFieldService.validate("Document", params.metadata, params.orgId, inheritedOrgIds);

		return this.documentRepository.create({
			orgId: params.orgId,
			region: params.region,
			title: params.title,
			code: params.code,
			text: params.text,
			version: params.version,
			locale: params.locale ?? null,
			metadata: params.metadata ?? null,
			status: params.status,
			date: params.date,
		});
	}

	public async update(id: number, params: DocumentUpdateAttributes, inheritedOrgIds: number[] = []): Promise<Document> {
		const document = await this.documentRepository.read(id);
		if (!document) {
			throw new NotFoundError(`${this.i18n.__("error.document.name")} ${id} ${this.i18n.__("error.common.not_found")}`);
		}

		const duplicate = await this.documentRepository.search({
			code: params.code,
			version: params.version,
			orgId: document.orgId,
			locale: [params.locale ?? null],
		});

		if (duplicate.data.some((doc) => Number(doc.id) !== Number(id))) {
			throw new ValidationError({
				documentId: [this.i18n.__("error.document.document_created")],
			});
		}

		const nextDocument = {
			...document.toJSON(),
			...params,
			locale: params.locale ?? document.locale,
			metadata: params.metadata !== undefined ? params.metadata : document.metadata,
		};

		await this.customFieldService.validate("Document", nextDocument.metadata, document.orgId, inheritedOrgIds);

		return this.documentRepository.update(id, {
			title: params.title,
			code: params.code,
			text: params.text,
			version: params.version,
			locale: params.locale ?? null,
			metadata: params.metadata,
			status: params.status,
			date: params.date,
		});
	}
}
