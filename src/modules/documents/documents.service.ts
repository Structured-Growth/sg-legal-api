import { autoInjectable, inject, ValidationError, I18nType } from "@structured-growth/microservice-sdk";
import { DocumentsRepository } from "./documents.repository";
import Document, { DocumentCreationAttributes } from "../../../database/models/document";

@autoInjectable()
export class DocumentsService {
	private i18n: I18nType;
	constructor(
		@inject("DocumentsRepository") private documentRepository: DocumentsRepository,
		@inject("i18n") private getI18n: () => I18nType
	) {
		this.i18n = this.getI18n();
	}

	public async create(params: DocumentCreationAttributes): Promise<Document> {
		const document = await this.documentRepository.search({ code: params.code, version: params.version });

		if (document.data.length > 0) {
			throw new ValidationError({
				documentId: [this.i18n.__("error.document.document_created")],
			});
		}

		return this.documentRepository.create({
			orgId: params.orgId,
			region: params.region,
			title: params.title,
			code: params.code,
			text: params.text,
			version: params.version,
			status: params.status,
			date: params.date,
		});
	}
}
