import { joi } from "@structured-growth/microservice-sdk";

export const DocumentCreateParamsValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().required().label("Organization Id"),
		region: joi.string().required().min(2).max(10).label("Region"),
		title: joi.string().max(100).required().label("Title"),
		code: joi.string().max(100).required().label("Code"),
		text: joi.string().required().label("Text"),
		version: joi.number().positive().required().label("Version"),
		status: joi.string().required().valid("active", "inactive", "archived"),
		date: joi.date().iso().required().label("Date"),
	}),
});
