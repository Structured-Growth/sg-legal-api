import { autoInjectable, inject } from "@structured-growth/microservice-sdk";
import { DocumentsRepository } from "./documents.repository";

@autoInjectable()
export class DocumentsService {
	constructor(@inject("DocumentsRepository") private documentRepository: DocumentsRepository) {}
}
