import { autoInjectable, inject, NotFoundError, ValidationError, I18nType } from "@structured-growth/microservice-sdk";
import { AgreementsRepository } from "./agreements.repository";
import { DocumentsRepository } from "../documents/documents.repository";
import { AgreementCheckParamsInterface } from "../../interfaces/agreement-check-params.interface";
import Agreement, { AgreementCreationAttributes } from "../../../database/models/agreement";
import Document from "../../../database/models/document";
import { AgreementUpdateBodyInterface } from "../../interfaces/agreement-update-body.interface";
import { CustomFieldService } from "../custom-fields/custom-field.service";

@autoInjectable()
export class AgreementsService {
	private i18n: I18nType;
	constructor(
		@inject("AgreementsRepository") private agreementRepository: AgreementsRepository,
		@inject("DocumentsRepository") private documentsRepository: DocumentsRepository,
		@inject("CustomFieldService") private customFieldService: CustomFieldService,
		@inject("i18n") private getI18n: () => I18nType
	) {
		this.i18n = this.getI18n();
	}

	public async create(params: AgreementCreationAttributes, inheritedOrgIds: number[] = []): Promise<Agreement> {
		const agreement = await this.agreementRepository.search({
			documentId: [params.documentId],
			accountId: params.accountId,
		});

		if (agreement.data.length > 0) {
			throw new ValidationError({
				documentId: [this.i18n.__("error.agreement.document_signed")],
			});
		}

		await this.customFieldService.validate("Agreement", params.metadata, params.orgId, inheritedOrgIds);

		return this.agreementRepository.create({
			orgId: params.orgId,
			region: params.region,
			documentId: params.documentId,
			accountId: params.accountId,
			userId: params.userId,
			metadata: params.metadata ?? null,
			status: params.status,
			date: params.date,
		});
	}

	public async update(
		id: number,
		params: AgreementUpdateBodyInterface,
		inheritedOrgIds: number[] = []
	): Promise<Agreement> {
		const agreement = await this.agreementRepository.read(id);

		if (!agreement) {
			throw new NotFoundError(
				`${this.i18n.__("error.agreement.name")} ${id} ${this.i18n.__("error.common.not_found")}`
			);
		}

		const nextAgreement = {
			...agreement.toJSON(),
			...params,
			metadata: params.metadata !== undefined ? params.metadata : agreement.metadata,
		};

		await this.customFieldService.validate("Agreement", nextAgreement.metadata, agreement.orgId, inheritedOrgIds);

		return this.agreementRepository.update(id, params);
	}

	public async check(
		params: AgreementCheckParamsInterface
	): Promise<{ document: Document; agreement: Agreement | null }> {
		const { accountId, documentCode } = params;

		const documentLangVersion = await this.documentsRepository.search({
			code: documentCode,
			locale: [this.i18n.acceptLanguage || this.i18n.locale],
			sort: ["version:desc"],
		});

		let document;

		if (documentLangVersion.data.length === 0) {
			const documentResult = await this.documentsRepository.search({
				code: documentCode,
				locale: null,
				sort: ["version:desc"],
			});

			if (documentResult.data.length === 0) {
				throw new NotFoundError(
					`${this.i18n.__("error.agreement.document")} ${documentCode} ${this.i18n.__("error.common.not_found")}`
				);
			}

			document = documentResult.data[0];
		} else {
			document = documentLangVersion.data[0];
		}

		const agreement = await this.agreementRepository.search({ accountId, documentId: [document.id] });

		return {
			document,
			agreement: agreement.data.length > 0 ? agreement.data[0] : null,
		};
	}
}
