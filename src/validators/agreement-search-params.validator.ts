import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const AgreementSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().label("Organization ID"),
			documentId: joi.array().items(joi.number().positive()).label("Document ID"),
			accountId: joi.number().positive().label("Account ID"),
			userId: joi.number().positive().label("User ID"),
			status: joi.string().valid("active", "inactive", "archived"),
			date: joi.date().iso().label("Date"),
		})
		.concat(CommonSearchParamsValidator),
});
