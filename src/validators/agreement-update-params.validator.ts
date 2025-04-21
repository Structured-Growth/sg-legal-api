import { joi } from "@structured-growth/microservice-sdk";

export const AgreementUpdateParamsValidator = joi.object({
	agreementId: joi.number().positive().required().label("validator.agreements.agreementId"),
	query: joi.object(),
	body: joi.object({
		status: joi.string().valid("active", "inactive", "archived"),
		date: joi.date().iso().label("validator.agreements.date"),
	}),
});
