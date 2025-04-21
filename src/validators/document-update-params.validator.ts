import { joi } from "@structured-growth/microservice-sdk";

export const DocumentUpdateParamsValidator = joi.object({
	documentId: joi.number().positive().required().label("validator.documents.documentId"),
	query: joi.object(),
	body: joi.object({
		title: joi.string().max(100).label("validator.documents.title"),
		code: joi.string().max(100).label("validator.documents.code"),
		text: joi.string().label("validator.documents.text"),
		version: joi.number().positive().label("validator.documents.version"),
		status: joi.string().valid("active", "inactive", "archived"),
		date: joi.date().iso().label("validator.documents.date"),
	}),
});
