import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const DocumentSearchWithPostParamsValidator = joi.object({
	query: joi.object(),
	body: joi
		.object({
			orgId: joi.number().positive().label("validator.documents.orgId"),
			title: joi.string().max(100).label("validator.documents.title"),
			code: joi.string().max(100).label("validator.documents.code"),
			version: joi.number().positive().label("validator.documents.version"),
			locale: joi.array().items(joi.string().max(15)).label("validator.documents.locale"),
			status: joi.string().valid("active", "inactive", "archived"),
			date: joi.date().iso().label("validator.documents.date"),
		})
		.concat(CommonSearchParamsValidator),
});
