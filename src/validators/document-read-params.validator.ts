import { joi } from "@structured-growth/microservice-sdk";

export const DocumentReadParamsValidator = joi.object({
	documentId: joi.number().positive().required().label("Document Id"),
});
