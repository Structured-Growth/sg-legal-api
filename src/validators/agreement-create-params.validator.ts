import { joi } from "@structured-growth/microservice-sdk";

export const AgreementCreateParamsValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().required().label("Organization Id"),
		region: joi.string().required().min(2).max(10).label("Region"),
		documentId: joi.number().positive().required().label("Document Id"),
		accountId: joi.number().positive().required().label("Account Id"),
		userId: joi.number().positive().required().label("User Id"),
		status: joi.string().required().valid("active", "inactive", "archived"),
		date: joi.date().iso().required().label("Date"),
	}),
});
