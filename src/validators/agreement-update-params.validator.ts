import { joi } from "@structured-growth/microservice-sdk";

export const AgreementUpdateParamsValidator = joi.object({
	agreementId: joi.number().positive().required().label("validator.agreements.agreementId"),
	query: joi.object(),
	body: joi.object({
		metadata: joi.object().allow(null).label("validator.agreements.metadata"),
		status: joi.string().valid("active", "inactive", "archived"),
		date: joi.date().iso().label("validator.agreements.date"),
	}),
});
