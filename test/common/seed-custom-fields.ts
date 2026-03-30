import { joi, RegionEnum } from "@structured-growth/microservice-sdk";
import CustomField from "../../database/models/custom-field";

export async function seedDocumentCustomFields(orgId: number): Promise<void> {
	await CustomField.create({
		orgId,
		region: RegionEnum.US,
		entity: "Document",
		title: "Approval Code",
		name: "approvalCode",
		schema: joi.string().min(2).describe(),
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
		schema: joi.string().min(2).describe(),
		status: "active",
	});
}
