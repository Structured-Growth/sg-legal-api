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
} from "@structured-growth/microservice-sdk";
import { pick } from "lodash";
import { AgreementAttributes } from "../../../database/models/agreement";
import { AgreementsRepository } from "../../modules/agreements/agreements.repository";
import { AgreementSearchParamsInterface } from "../../interfaces/agreement-search-params.interface";
import { AgreementCreateBodyInterface } from "../../interfaces/agreement-create-body.interface";
import { AgreementUpdateBodyInterface } from "../../interfaces/agreement-update-body.interface";
import { AgreementSearchParamsValidator } from "../../validators/agreement-search-params.validator";
import { AgreementCreateParamsValidator } from "../../validators/agreement-create-params.validator";
import { AgreementReadParamsValidator } from "../../validators/agreement-read-params.validator";
import { AgreementUpdateParamsValidator } from "../../validators/agreement-update-params.validator";
import { AgreementDeleteParamsValidator } from "../../validators/agreement-delete-params.validator";

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
	constructor(@inject("AgreementsRepository") private agreementsRepository: AgreementsRepository) {
		super();
	}

	/**
	 * Search Agreements
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of agreements")
	@DescribeAction("agreements/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
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
	 * Create Agreement
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created agreement")
	@DescribeAction("agreements/create")
	@ValidateFuncArgs(AgreementCreateParamsValidator)
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	async create(@Queries() query: {}, @Body() body: AgreementCreateBodyInterface): Promise<PublicAgreementAttributes> {
		const agreement = await this.agreementsRepository.create(body);
		this.response.status(201);

		return {
			...(pick(agreement.toJSON(), publicAgreementAttributes) as PublicAgreementAttributes),
			arn: agreement.arn,
		};
	}

	/**
	 * Get Agreement
	 */
	@OperationId("Read")
	@Get("/:agreementId")
	@SuccessResponse(200, "Returns agreement")
	@DescribeAction("agreements/read")
	@DescribeResource("Agreement", ({ params }) => Number(params.agreementId))
	@ValidateFuncArgs(AgreementReadParamsValidator)
	async get(@Path() agreementId: number): Promise<PublicAgreementAttributes> {
		const agreement = await this.agreementsRepository.read(agreementId);

		if (!agreement) {
			throw new NotFoundError(`Agreement ${agreement} not found`);
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
	@DescribeResource("Agreement", ({ params }) => Number(params.agreementId))
	@ValidateFuncArgs(AgreementUpdateParamsValidator)
	async update(
		@Path() agreementId: number,
		@Queries() query: {},
		@Body() body: AgreementUpdateBodyInterface
	): Promise<PublicAgreementAttributes> {
		const agreement = await this.agreementsRepository.update(agreementId, body);

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
	@DescribeResource("Agreement", ({ params }) => Number(params.agreementId))
	@ValidateFuncArgs(AgreementDeleteParamsValidator)
	async delete(@Path() agreementId: number): Promise<void> {
		await this.agreementsRepository.delete(agreementId);
		this.response.status(204);
	}
}
