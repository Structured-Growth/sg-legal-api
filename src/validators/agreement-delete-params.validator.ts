import { joi } from "@structured-growth/microservice-sdk";

export const AgreementDeleteParamsValidator = joi.object({
	agreementId: joi.number().positive().required().label("Agreement Id"),
});
