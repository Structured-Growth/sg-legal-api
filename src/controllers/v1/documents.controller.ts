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
} from "@structured-growth/microservice-sdk";
import { pick } from "lodash";
import { DocumentAttributes } from "../../../database/models/document";
import { DocumentsRepository } from "../../modules/documents/documents.repository";
import { DocumentsService } from "../../modules/documents/documents.service";
import { DocumentSearchParamsInterface } from "../../interfaces/document-search-params.interface";
import { DocumentCreateBodyInterface } from "../../interfaces/document-create-body.interface";
import { DocumentUpdateBodyInterface } from "../../interfaces/document-update-body.interface";
import { DocumentSearchParamsValidator } from "../../validators/document-search-params.validator";
import { DocumentSearchWithPostParamsValidator } from "../../validators/document-search-with-post-params.validator";
import { DocumentCreateParamsValidator } from "../../validators/document-create-params.validator";
import { DocumentReadParamsValidator } from "../../validators/document-read-params.validator";
import { DocumentUpdateParamsValidator } from "../../validators/document-update-params.validator";
import { DocumentDeleteParamsValidator } from "../../validators/document-delete-params.validator";
import { EventMutation } from "@structured-growth/microservice-sdk";

export const publicDocumentAttributes = [
	"id",
	"orgId",
	"region",
	"title",
	"code",
	"text",
	"version",
	"status",
	"date",
	"createdAt",
	"updatedAt",
	"arn",
] as const;
type DocumentKeys = (typeof publicDocumentAttributes)[number];
export type PublicDocumentAttributes = Pick<DocumentAttributes, DocumentKeys>;

@Route("v1/documents")
@Tags("Documents")
@autoInjectable()
export class DocumentsController extends BaseController {
	private i18n: I18nType;
	constructor(
		@inject("DocumentsRepository") private documentsRepository: DocumentsRepository,
		@inject("DocumentsService") private documentsService: DocumentsService,
		@inject("i18n") private getI18n: () => I18nType
	) {
		super();
		this.i18n = this.getI18n();
	}

	/**
	 * Search Documents
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of documents")
	@DescribeAction("documents/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	@DescribeResource("Document", ({ query }) => query.id?.map(Number))
	@ValidateFuncArgs(DocumentSearchParamsValidator)
	async search(
		@Queries() query: DocumentSearchParamsInterface
	): Promise<SearchResultInterface<PublicDocumentAttributes>> {
		const { data, ...result } = await this.documentsRepository.search(query);

		return {
			data: data.map((document) => ({
				...(pick(document.toJSON(), publicDocumentAttributes) as PublicDocumentAttributes),
				arn: document.arn,
			})),
			...result,
		};
	}

	/**
	 * Search documents with POST
	 */
	@OperationId("Search documents with POST")
	@Post("/search")
	@SuccessResponse(200, "Returns list of documents")
	@DescribeAction("documents/search")
	@DescribeResource("Organization", ({ body }) => Number(body.orgId))
	@DescribeResource("Document", ({ body }) => body.id?.map(Number))
	@ValidateFuncArgs(DocumentSearchWithPostParamsValidator)
	async searchPost(
		@Queries() query: {},
		@Body() body: DocumentSearchParamsInterface
	): Promise<SearchResultInterface<PublicDocumentAttributes>> {
		const { data, ...result } = await this.documentsRepository.search(body);

		return {
			data: data.map((document) => ({
				...(pick(document.toJSON(), publicDocumentAttributes) as PublicDocumentAttributes),
				arn: document.arn,
			})),
			...result,
		};
	}

	/**
	 * Create Document
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created document")
	@DescribeAction("documents/create")
	@ValidateFuncArgs(DocumentCreateParamsValidator)
	@DescribeResource("Organization", ({ body }) => Number(body.orgId))
	async create(@Queries() query: {}, @Body() body: DocumentCreateBodyInterface): Promise<PublicDocumentAttributes> {
		const document = await this.documentsService.create(body);
		this.response.status(201);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, document.arn, `${this.appPrefix}:documents/create`, JSON.stringify(body))
		);

		return {
			...(pick(document.toJSON(), publicDocumentAttributes) as PublicDocumentAttributes),
			arn: document.arn,
		};
	}

	/**
	 * Get Document
	 */
	@OperationId("Read")
	@Get("/:documentId")
	@SuccessResponse(200, "Returns document")
	@DescribeAction("documents/read")
	@DescribeResource("Document", ({ params }) => Number(params.documentId))
	@ValidateFuncArgs(DocumentReadParamsValidator)
	async get(@Path() documentId: number): Promise<PublicDocumentAttributes> {
		const document = await this.documentsRepository.read(documentId);

		if (!document) {
			throw new NotFoundError(
				`${this.i18n.__("error.document.name")} ${document} ${this.i18n.__("error.common.not_found")}`
			);
		}

		return {
			...(pick(document.toJSON(), publicDocumentAttributes) as PublicDocumentAttributes),
			arn: document.arn,
		};
	}

	/**
	 * Update Document
	 */
	@OperationId("Update")
	@Put("/:documentId")
	@SuccessResponse(200, "Returns updated document")
	@DescribeAction("documents/update")
	@DescribeResource("Document", ({ params }) => Number(params.documentId))
	@ValidateFuncArgs(DocumentUpdateParamsValidator)
	async update(
		@Path() documentId: number,
		@Queries() query: {},
		@Body() body: DocumentUpdateBodyInterface
	): Promise<PublicDocumentAttributes> {
		const document = await this.documentsRepository.update(documentId, body);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, document.arn, `${this.appPrefix}:documents/update`, JSON.stringify(body))
		);

		return {
			...(pick(document.toJSON(), publicDocumentAttributes) as PublicDocumentAttributes),
			arn: document.arn,
		};
	}

	/**
	 * Mark Document as deleted. Will be permanently deleted in 90 days.
	 */
	@OperationId("Delete")
	@Delete("/:documentId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("documents/delete")
	@DescribeResource("Document", ({ params }) => Number(params.documentId))
	@ValidateFuncArgs(DocumentDeleteParamsValidator)
	async delete(@Path() documentId: number): Promise<void> {
		const document = await this.documentsRepository.read(documentId);

		if (!document) {
			throw new NotFoundError(
				`${this.i18n.__("error.document.name")} ${documentId} ${this.i18n.__("error.common.not_found")}`
			);
		}
		await this.documentsRepository.delete(documentId);

		await this.eventBus.publish(
			new EventMutation(this.principal.arn, document.arn, `${this.appPrefix}:documents/delete`, JSON.stringify({}))
		);

		this.response.status(204);
	}
}
