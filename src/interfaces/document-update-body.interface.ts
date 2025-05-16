import { DocumentAttributes } from "../../database/models/document";

export interface DocumentUpdateBodyInterface {
	title?: string;
	code?: string;
	text?: string;
	version?: number;
	locale?: string;
	status?: DocumentAttributes["status"];
	date?: Date;
}
