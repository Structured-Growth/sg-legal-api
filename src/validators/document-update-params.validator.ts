import { joi } from "@structured-growth/microservice-sdk";

export const DocumentUpdateParamsValidator = joi.object({
	documentId: joi.number().positive().required().label("Document Id"),
	query: joi.object(),
	body: joi.object({
		title: joi.string().max(100).label("Title"),
		code: joi.string().max(100).label("Code"),
		text: joi.string().label("Text"),
		version: joi.number().positive().label("Version"),
		status: joi.string().valid("active", "inactive", "archived"),
		date: joi.date().iso().label("Date"),
	}),
});
