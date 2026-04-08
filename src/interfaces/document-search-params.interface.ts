import { DefaultSearchParamsInterface } from "@structured-growth/microservice-sdk";
import { DocumentAttributes } from "../../database/models/document";

export interface DocumentSearchParamsInterface extends Omit<DefaultSearchParamsInterface, "accountId" | "orgId"> {
	orgId?: number;
	title?: string;
	code?: string;
	version?: number;
	locale?: string[];
	/**
	 * Search by custom entity fields.
	 * Example: metadata[approvalCode]=OK
	 */
	"metadata[customFieldName]"?: string;
	status?: DocumentAttributes["status"];
	date?: Date;
}
