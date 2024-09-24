import { DocumentAttributes } from "../../database/models/document";

export interface AgreementUpdateBodyInterface {
	status?: DocumentAttributes["status"];
	date?: Date;
}
