import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { seedDocumentCustomFields } from "../../../common/seed-custom-fields";

describe("PUT /api/v1/documents/:documentId", () => {
	const { server, context } = initTest();
	const orgId = Math.floor(Math.random() * 1000000) + 1;

	beforeEach(() => seedDocumentCustomFields(orgId));

	it("Should create document", async () => {
		const { statusCode, body } = await server.post("/v1/documents").send({
			orgId,
			region: "us",
			title: "Policy",
			code: `doc-${orgId}-update`,
			text: "Initial",
			version: 1,
			metadata: {
				approvalCode: "AA",
			},
			status: "active",
			date: new Date().toISOString(),
		});

		assert.equal(statusCode, 201);
		context.documentId = body.id;
	});

	it("Should update metadata", async () => {
		const { statusCode, body } = await server.put(`/v1/documents/${context.documentId}`).send({
			metadata: {
				approvalCode: "BB",
			},
		});

		assert.equal(statusCode, 200);
		assert.equal(body.metadata.approvalCode, "BB");
	});

	it("Should return validation error for invalid metadata", async () => {
		const { statusCode, body } = await server.put(`/v1/documents/${context.documentId}`).send({
			metadata: {
				approvalCode: 10,
			},
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.metadata.approvalCode[0]);
	});
});
