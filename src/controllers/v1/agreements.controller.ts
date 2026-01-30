import { Get, Route, Tags, Queries, OperationId, SuccessResponse, Body, Post, Path, Put, Delete } from "tsoa";
import {
	autoInjectable,
	BaseController,
	DescribeAction,
	DescribeResource,
	inject,
	NotFoundError,
	SearchResultInterface,
	ValidateFuncArgs,
	I18nType,
	HashFields,
} from "@structured-growth/microservice-sdk";
import { pick } from "lodash";
import { AgreementAttributes } from "../../../database/models/agreement";
import { AgreementsRepository } from "../../modules/agreements/agreements.repository";
import { AgreementsService } from "../../modules/agreements/agreements.service";
import { AgreementSearchParamsInterface } from "../../interfaces/agreement-search-params.interface";
import { AgreementCreateBodyInterface } from "../../interfaces/agreement-create-body.interface";
import { AgreementUpdateBodyInterface } from "../../interfaces/agreement-update-body.interface";
import { AgreementCheckParamsInterface } from "../../interfaces/agreement-check-params.interface";
import { AgreementSearchParamsValidator } from "../../validators/agreement-search-params.validator";
import { AgreementSearchWithPostParamsValidator } from "../../validators/agreement-search-with-post-params.validator";
import { AgreementCreateParamsValidator } from "../../validators/agreement-create-params.validator";
import { AgreementReadParamsValidator } from "../../validators/agreement-read-params.validator";
import { AgreementUpdateParamsValidator } from "../../validators/agreement-update-params.validator";
import { AgreementDeleteParamsValidator } from "../../validators/agreement-delete-params.validator";
import { AgreementCheckParamsValidator } from "../../validators/agreement-check-params.validator";
import { EventMutation } from "@structured-growth/microservice-sdk";
import { PublicDocumentAttributes, publicDocumentAttributes } from "./documents.controller";

export const publicAgreementAttributes = [
	"id",
	"orgId",
	"region",
	"documentId",
	"accountId",
	"userId",
	"status",
	"date",
	"createdAt",
	"updatedAt",
	"arn",
] as const;
type AgreementKeys = (typeof publicAgreementAttributes)[number];
export type PublicAgreementAttributes = Pick<AgreementAttributes, AgreementKeys>;

@Route("v1/agreements")
@Tags("Agreements")
@autoInjectable()
export class AgreementsController extends BaseController {
	private i18n: I18nType;
	constructor(
		@inject("AgreementsRepository") private agreementsRepository: AgreementsRepository,
		@inject("AgreementsService") private agreementsService: AgreementsService,
		@inject("i18n") private getI18n: () => I18nType
	) {
		super();
		this.i18n = this.getI18n();
	}

	/**
	 * Search Agreements
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of agreements")
	@DescribeAction("agreements/search")
	@DescribeResource("Organization", ({ query }) => [Number(query.orgId)])
	@DescribeResource("Account", ({ query }) => [Number(query.accountId)])
	@DescribeResource("User", ({ query }) => [Number(query.userId)])
	@DescribeResource("Document", ({ query }) => query.documentId?.map(Number))
	@DescribeResource("Agreement", ({ query }) => query.id?.map(Number))
	@ValidateFuncArgs(AgreementSearchParamsValidator)
	async search(
		@Queries() query: AgreementSearchParamsInterface
	): Promise<SearchResultInterface<PublicAgreementAttributes>> {
		const { data, ...result } = await this.agreementsRepository.search(query);

		return {
			data: data.map((agreement) => ({
				...(pick(agreement.toJSON(), publicAgreementAttributes) as PublicAgreementAttributes),
				arn: agreement.arn,
			})),
			...result,
		};
	}

	/**
	 * Search agreements with POST
	 */
	@OperationId("Search agreements with POST")
	@Post("/search")
	@SuccessResponse(200, "Returns list of agreements")
	@DescribeAction("agreements/search")
	@DescribeResource("Organization", ({ body }) => [Number(body.orgId)])
	@DescribeResource("Account", ({ body }) => [Number(body.accountId)])
	@DescribeResource("User", ({ body }) => [Number(body.userId)])
	@DescribeResource("Document", ({ body }) => body.documentId?.map(Number))
	@DescribeResource("Agreement", ({ body }) => body.id?.map(Number))
	@ValidateFuncArgs(AgreementSearchWithPostParamsValidator)
	async searchPost(
		@Queries() query: {},
		@Body() body: AgreementSearchParamsInterface
	): Promise<SearchResultInterface<PublicAgreementAttributes>> {
		const { data, ...result } = await this.agreementsRepository.search(body);

		return {
			data: data.map((agreement) => ({
				...(pick(agreement.toJSON(), publicAgreementAttributes) as PublicAgreementAttributes),
				arn: agreement.arn,
			})),
			...result,
		};
	}

	/**
	 * Create Agreement
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created agreement")
	@DescribeAction("agreements/create")
	@ValidateFuncArgs(AgreementCreateParamsValidator)
	@DescribeResource("Organization", ({ body }) => [Number(body.orgId)])
	@DescribeResource("Account", ({ body }) => [Number(body.accountId)])
	@DescribeResource("User", ({ body }) => [Number(body.userId)])
	@DescribeResource("Document", ({ body }) => [Number(body.documentId)])
	async create(@Queries() query: {}, @Body() body: AgreementCreateBodyInterface): Promise<PublicAgreementAttributes> {
		const agreement = await this.agreementsService.create(body);
		this.response.status(201);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, agreement.arn, `${this.appPrefix}:agreements/create`, JSON.stringify(body))
		);

		return {
			...(pick(agreement.toJSON(), publicAgreementAttributes) as PublicAgreementAttributes),
			arn: agreement.arn,
		};
	}

	/**
	 * Check Agreement
	 * Checks the current state of the document and whether it has been signed.
	 */
	@OperationId("Check")
	@Get("/check")
	@SuccessResponse(200, "Returns agreement with last document version")
	@DescribeAction("agreements/check")
	@DescribeResource("Account", ({ query }) => [Number(query.accountId)])
	@HashFields(["documentCode", "title", "code", "text"])
	@ValidateFuncArgs(AgreementCheckParamsValidator)
	async check(
		@Queries() query: AgreementCheckParamsInterface
	): Promise<{ document: PublicDocumentAttributes; agreement: PublicAgreementAttributes | null }> {
		const { document, agreement } = await this.agreementsService.check(query);

		return {
			document: {
				...(pick(document.toJSON(), publicDocumentAttributes) as PublicDocumentAttributes),
				arn: document.arn,
			},
			agreement: agreement
				? {
						...(pick(agreement.toJSON(), publicAgreementAttributes) as PublicAgreementAttributes),
						arn: agreement.arn,
				  }
				: null,
		};
	}

	/**
	 * Get Agreement
	 */
	@OperationId("Read")
	@Get("/:agreementId")
	@SuccessResponse(200, "Returns agreement")
	@DescribeAction("agreements/read")
	@DescribeResource("Agreement", ({ params }) => [Number(params.agreementId)])
	@ValidateFuncArgs(AgreementReadParamsValidator)
	async get(@Path() agreementId: number): Promise<PublicAgreementAttributes> {
		const agreement = await this.agreementsRepository.read(agreementId);

		if (!agreement) {
			throw new NotFoundError(
				`${this.i18n.__("error.agreement.name")} ${agreement} ${this.i18n.__("error.common.not_found")}`
			);
		}

		return {
			...(pick(agreement.toJSON(), publicAgreementAttributes) as PublicAgreementAttributes),
			arn: agreement.arn,
		};
	}

	/**
	 * Update Agreement
	 */
	@OperationId("Update")
	@Put("/:agreementId")
	@SuccessResponse(200, "Returns updated agreement")
	@DescribeAction("agreements/update")
	@DescribeResource("Agreement", ({ params }) => [Number(params.agreementId)])
	@ValidateFuncArgs(AgreementUpdateParamsValidator)
	async update(
		@Path() agreementId: number,
		@Queries() query: {},
		@Body() body: AgreementUpdateBodyInterface
	): Promise<PublicAgreementAttributes> {
		const agreement = await this.agreementsRepository.update(agreementId, body);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, agreement.arn, `${this.appPrefix}:agreements/update`, JSON.stringify(body))
		);

		return {
			...(pick(agreement.toJSON(), publicAgreementAttributes) as PublicAgreementAttributes),
			arn: agreement.arn,
		};
	}

	/**
	 * Mark Agreement as deleted. Will be permanently deleted in 90 days.
	 */
	@OperationId("Delete")
	@Delete("/:agreementId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("agreements/delete")
	@DescribeResource("Agreement", ({ params }) => [Number(params.agreementId)])
	@ValidateFuncArgs(AgreementDeleteParamsValidator)
	async delete(@Path() agreementId: number): Promise<void> {
		const agreement = await this.agreementsRepository.read(agreementId);

		if (!agreement) {
			throw new NotFoundError(
				`${this.i18n.__("error.agreement.name")} ${agreementId} ${this.i18n.__("error.common.not_found")}`
			);
		}

		await this.agreementsRepository.delete(agreementId);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, agreement.arn, `${this.appPrefix}:agreements/delete`, JSON.stringify({}))
		);

		this.response.status(204);
	}
}
