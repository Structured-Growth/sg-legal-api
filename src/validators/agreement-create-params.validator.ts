import { joi } from "@structured-growth/microservice-sdk";

export const AgreementCreateParamsValidator = joi.object({
	query: joi.object(),
	body: joi.object({
		orgId: joi.number().positive().required().label("validator.agreements.orgId"),
		region: joi.string().required().min(2).max(10).label("validator.agreements.region"),
		documentId: joi.number().positive().required().label("validator.agreements.documentId"),
		accountId: joi.number().positive().required().label("validator.agreements.accountId"),
		userId: joi.number().positive().required().label("validator.agreements.userId"),
		metadata: joi.object().label("validator.agreements.metadata"),
		status: joi.string().required().valid("active", "inactive", "archived"),
		date: joi.date().iso().required().label("validator.agreements.date"),
	}),
});
