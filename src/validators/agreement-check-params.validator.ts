import { joi } from "@structured-growth/microservice-sdk";

export const AgreementCheckParamsValidator = joi.object({
	query: joi.object({
		accountId: joi.number().positive().required().label("Account ID"),
		documentCode: joi.string().max(100).required().label("Code"),
	}),
});
