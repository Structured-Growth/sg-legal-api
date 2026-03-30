import { DocumentAttributes } from "../../database/models/document";

export interface AgreementUpdateBodyInterface {
	metadata?: Record<string, unknown> | null;
	status?: DocumentAttributes["status"];
	date?: Date;
}
