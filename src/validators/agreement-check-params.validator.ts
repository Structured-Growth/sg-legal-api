import { joi } from "@structured-growth/microservice-sdk";

export const AgreementCheckParamsValidator = joi.object({
	query: joi.object({
		accountId: joi.number().positive().required().label("validator.agreements.accountId"),
		documentCode: joi.string().max(100).required().label("validator.agreements.documentCode"),
	}),
});
