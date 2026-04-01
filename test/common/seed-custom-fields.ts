import { RegionEnum } from "@structured-growth/microservice-sdk";
import CustomField from "../../database/models/custom-field";
import { customFieldAlternativesSchema } from "./custom-field-schema";

export async function seedDocumentCustomFields(orgId: number): Promise<void> {
	await CustomField.create({
		orgId,
		region: RegionEnum.US,
		entity: "Document",
		title: "Approval Code",
		name: "approvalCode",
		schema: customFieldAlternativesSchema,
		status: "active",
	});
}

export async function seedAgreementCustomFields(orgId: number): Promise<void> {
	await CustomField.create({
		orgId,
		region: RegionEnum.US,
		entity: "Agreement",
		title: "Sign Source",
		name: "signSource",
		schema: customFieldAlternativesSchema,
		status: "active",
	});
}
