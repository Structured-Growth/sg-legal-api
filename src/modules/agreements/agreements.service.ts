import { autoInjectable, inject, NotFoundError, ValidationError } from "@structured-growth/microservice-sdk";
import { AgreementsRepository } from "./agreements.repository";
import { DocumentsRepository } from "../documents/documents.repository";
import { AgreementCheckParamsInterface } from "../../interfaces/agreement-check-params.interface";
import Agreement, { AgreementCreationAttributes } from "../../../database/models/agreement";
import Document from "../../../database/models/document";

@autoInjectable()
export class AgreementsService {
	constructor(
		@inject("AgreementsRepository") private agreementRepository: AgreementsRepository,
		@inject("DocumentsRepository") private documentsRepository: DocumentsRepository
	) {}

	public async create(params: AgreementCreationAttributes): Promise<Agreement> {
		const agreement = await this.agreementRepository.search({
			documentId: [params.documentId],
			accountId: params.accountId,
		});

		if (agreement.data.length > 0) {
			throw new ValidationError({
				documentId: ["A document with this ID has already been signed."],
			});
		}

		return this.agreementRepository.create({
			orgId: params.orgId,
			region: params.region,
			documentId: params.documentId,
			accountId: params.accountId,
			userId: params.userId,
			status: params.status,
			date: params.date,
		});
	}

	public async check(
		params: AgreementCheckParamsInterface
	): Promise<{ document: Document; agreement: Agreement | null }> {
		const { accountId, documentCode } = params;

		const document = await this.documentsRepository.search({ code: documentCode, sort: ["version:desc"] });

		if (document.data.length === 0) {
			throw new NotFoundError(`Document with code ${documentCode} not found`);
		}

		const agreement = await this.agreementRepository.search({ accountId, documentId: [document.data[0].id] });

		return {
			document: document.data[0],
			agreement: agreement.data.length > 0 ? agreement.data[0] : null,
		};
	}
}
