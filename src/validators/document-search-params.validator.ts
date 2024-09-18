import { joi } from "@structured-growth/microservice-sdk";
import { CommonSearchParamsValidator } from "./common-search-params.validator";

export const DocumentSearchParamsValidator = joi.object({
	query: joi
		.object({
			orgId: joi.number().positive().label("Organization ID"),
			title: joi.string().max(100).label("Title"),
			code: joi.string().max(100).label("Code"),
			version: joi.number().positive().label("Version"),
			status: joi.string().valid("active", "inactive", "archived"),
			date: joi.date().iso().label("Date"),
		})
		.concat(CommonSearchParamsValidator),
});
