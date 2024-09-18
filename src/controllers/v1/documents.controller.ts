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
import { DocumentAttributes } from "../../../database/models/document";
import { DocumentsRepository } from "../../modules/documents/documents.repository";
import { DocumentSearchParamsInterface } from "../../interfaces/document-search-params.interface";
import { DocumentCreateBodyInterface } from "../../interfaces/document-create-body.interface";
import { DocumentUpdateBodyInterface } from "../../interfaces/document-update-body.interface";
import { DocumentSearchParamsValidator } from "../../validators/document-search-params.validator";
import { DocumentCreateParamsValidator } from "../../validators/document-create-params.validator";
import { DocumentReadParamsValidator } from "../../validators/document-read-params.validator";
import { DocumentUpdateParamsValidator } from "../../validators/document-update-params.validator";
import { DocumentDeleteParamsValidator } from "../../validators/document-delete-params.validator";

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
	constructor(@inject("DocumentsRepository") private documentsRepository: DocumentsRepository) {
		super();
	}

	/**
	 * Search Documents
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of documents")
	@DescribeAction("documents/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
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
	 * Create Document
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created document")
	@DescribeAction("documents/create")
	@ValidateFuncArgs(DocumentCreateParamsValidator)
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	async create(@Queries() query: {}, @Body() body: DocumentCreateBodyInterface): Promise<PublicDocumentAttributes> {
		const document = await this.documentsRepository.create(body);
		this.response.status(201);

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
			throw new NotFoundError(`Document ${document} not found`);
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
		await this.documentsRepository.delete(documentId);
		this.response.status(204);
	}
}
