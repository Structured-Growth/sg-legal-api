import { joi } from "@structured-growth/microservice-sdk";

export const AgreementReadParamsValidator = joi.object({
	agreementId: joi.number().positive().required().label("validator.agreements.agreementId"),
});
