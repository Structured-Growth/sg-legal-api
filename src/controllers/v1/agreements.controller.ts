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
import { NoteAttributes } from "../../../database/models/note";
import { NotesRepository } from "../../modules/notes/notes.repository";
import { NoteSearchParamsInterface } from "../../interfaces/note-search-params.interface";
import { NoteCreateBodyInterface } from "../../interfaces/note-create-body.interface";
import { NoteUpdateBodyInterface } from "../../interfaces/note-update-body.interface";
import { NoteSearchParamsValidator } from "../../validators/note-search-params.validator";
import { NoteCreateParamsValidator } from "../../validators/note-create-params.validator";
import { NoteReadParamsValidator } from "../../validators/note-read-params.validator";
import { NoteUpdateParamsValidator } from "../../validators/note-update-params.validator";
import { NoteDeleteParamsValidator } from "../../validators/note-delete-params.validator";

export const publicNoteAttributes = [
	"id",
	"orgId",
	"region",
	"accountId",
	"userId",
	"note",
	"status",
	"createdAt",
	"updatedAt",
	"metadata",
	"arn",
] as const;
type NoteKeys = (typeof publicNoteAttributes)[number];
export type PublicNoteAttributes = Pick<NoteAttributes, NoteKeys>;

@Route("v1/notes")
@Tags("Notes")
@autoInjectable()
export class AgreementsController extends BaseController {
	constructor(@inject("NotesRepository") private notesRepository: NotesRepository) {
		super();
	}

	/**
	 * Search Notes
	 */
	@OperationId("Search")
	@Get("/")
	@SuccessResponse(200, "Returns list of notes")
	@DescribeAction("notes/search")
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	@ValidateFuncArgs(NoteSearchParamsValidator)
	async search(@Queries() query: NoteSearchParamsInterface): Promise<SearchResultInterface<PublicNoteAttributes>> {
		const { data, ...result } = await this.notesRepository.search(query);

		return {
			data: data.map((note) => ({
				...(pick(note.toJSON(), publicNoteAttributes) as PublicNoteAttributes),
				arn: note.arn,
			})),
			...result,
		};
	}

	/**
	 * Create Note
	 */
	@OperationId("Create")
	@Post("/")
	@SuccessResponse(201, "Returns created note")
	@DescribeAction("notes/create")
	@ValidateFuncArgs(NoteCreateParamsValidator)
	@DescribeResource("Organization", ({ query }) => Number(query.orgId))
	async create(@Queries() query: {}, @Body() body: NoteCreateBodyInterface): Promise<PublicNoteAttributes> {
		const note = await this.notesRepository.create(body);
		this.response.status(201);

		return {
			...(pick(note.toJSON(), publicNoteAttributes) as PublicNoteAttributes),
			arn: note.arn,
		};
	}

	/**
	 * Get Note
	 */
	@OperationId("Read")
	@Get("/:noteId")
	@SuccessResponse(200, "Returns note")
	@DescribeAction("Notes/read")
	@DescribeResource("Note", ({ params }) => Number(params.noteId))
	@ValidateFuncArgs(NoteReadParamsValidator)
	async get(@Path() noteId: number): Promise<PublicNoteAttributes> {
		const note = await this.notesRepository.read(noteId);

		if (!note) {
			throw new NotFoundError(`Note ${note} not found`);
		}

		return {
			...(pick(note.toJSON(), publicNoteAttributes) as PublicNoteAttributes),
			arn: note.arn,
		};
	}

	/**
	 * Update Note
	 */
	@OperationId("Update")
	@Put("/:noteId")
	@SuccessResponse(200, "Returns updated note")
	@DescribeAction("notes/update")
	@DescribeResource("Note", ({ params }) => Number(params.noteId))
	@ValidateFuncArgs(NoteUpdateParamsValidator)
	async update(
		@Path() noteId: number,
		@Queries() query: {},
		@Body() body: NoteUpdateBodyInterface
	): Promise<PublicNoteAttributes> {
		const note = await this.notesRepository.update(noteId, body);

		return {
			...(pick(note.toJSON(), publicNoteAttributes) as PublicNoteAttributes),
			arn: note.arn,
		};
	}

	/**
	 * Mark Note as deleted. Will be permanently deleted in 90 days.
	 */
	@OperationId("Delete")
	@Delete("/:noteId")
	@SuccessResponse(204, "Returns nothing")
	@DescribeAction("notes/delete")
	@DescribeResource("Note", ({ params }) => Number(params.noteId))
	@ValidateFuncArgs(NoteDeleteParamsValidator)
	async delete(@Path() noteId: number): Promise<void> {
		await this.notesRepository.delete(noteId);
		this.response.status(204);
	}
}
