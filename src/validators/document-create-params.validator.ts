import { joi } from "@structured-growth/microservice-sdk";

export const DocumentCreateParamsValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().required().label("validator.documents.orgId"),
		region: joi.string().required().min(2).max(10).label("validator.documents.region"),
		title: joi.string().max(100).required().label("validator.documents.title"),
		code: joi.string().max(100).required().label("validator.documents.code"),
		text: joi.string().required().label("validator.documents.text"),
		version: joi.number().positive().required().label("validator.documents.version"),
		status: joi.string().required().valid("active", "inactive", "archived"),
		date: joi.date().iso().required().label("validator.documents.date"),
	}),
});
