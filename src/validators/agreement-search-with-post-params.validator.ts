import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const AgreementSearchWithPostParamsValidator = joi.object({
	query: joi.object(),
	body: joi
		.object({
			orgId: joi.number().positive().label("validator.agreements.orgId"),
			documentId: joi.array().items(joi.number().positive()).label("validator.agreements.documentId"),
			accountId: joi.number().positive().label("validator.agreements.accountId"),
			userId: joi.number().positive().label("validator.agreements.userId"),
			status: joi.string().valid("active", "inactive", "archived"),
			date: joi.date().iso().label("validator.agreements.date"),
		})
		.concat(CommonSearchParamsValidator),
});
