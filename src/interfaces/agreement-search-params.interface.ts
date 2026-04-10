import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { AgreementAttributes } from "../../database/models/agreement";

export interface AgreementSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "accountId" | "orgId"> {
	orgId?: number;
	documentId?: number[];
	accountId?: number;
	userId?: number;
	/**
	 * Search by custom entity fields.
	 * Example: metadata[signSource]=web
	 */
	"metadata[customFieldName]"?: string;
	status?: AgreementAttributes["status"];
	date?: Date;
}
