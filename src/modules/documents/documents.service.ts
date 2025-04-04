import { autoInjectable, inject, ValidationError } from "@structured-growth/microservice-sdk";
import { DocumentsRepository } from "./documents.repository";
import Document, { DocumentCreationAttributes } from "../../../database/models/document";

@autoInjectable()
export class DocumentsService {
	constructor(@inject("DocumentsRepository") private documentRepository: DocumentsRepository) {}

	public async create(params: DocumentCreationAttributes): Promise<Document> {
		const document = await this.documentRepository.search({ code: params.code, version: params.version });

		if (document.data.length > 0) {
			throw new ValidationError({
				documentId: ["A document with this code and version has already been created."],
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
