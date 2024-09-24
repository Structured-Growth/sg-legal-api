import { DocumentAttributes } from "../../database/models/document";

export interface DocumentUpdateBodyInterface {
	title?: string;
	code?: string;
	text?: string;
	version?: number;
	status?: DocumentAttributes["status"];
	date?: Date;
}
