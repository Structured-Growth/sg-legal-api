import { DocumentAttributes } from "../../database/models/document";

export interface AgreementUpdateBodyInterface {
	metadata?: Record<string, unknown>;
	status?: DocumentAttributes["status"];
	date?: Date;
}
