import { joi } from "@structured-growth/microservice-sdk";

export const DocumentDeleteParamsValidator = joi.object({
	documentId: joi.number().positive().required().label("validator.documents.documentId"),
});
