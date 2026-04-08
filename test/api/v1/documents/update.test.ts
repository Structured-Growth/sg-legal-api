import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { seedDocumentCustomFields } from "../../../common/seed-custom-fields";

describe("PUT /api/v1/documents/:documentId", () => {
	const { server, context } = initTest();
	let orgId: number;

	beforeEach(async () => {
		orgId = Math.floor(Math.random() * 1000000) + 1;
		await seedDocumentCustomFields(orgId);
	});

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

	it("Should update document", async () => {
		const date = new Date().toISOString();

		const { statusCode, body } = await server.put(`/v1/documents/${context.documentId}`).send({
			title: "Updated Policy",
			code: `doc-${orgId}-updated`,
			text: "Updated text",
			version: 2,
			locale: "pt-PT",
			metadata: {
				approvalCode: "BB",
			},
			status: "inactive",
			date,
		});

		assert.equal(statusCode, 200);
		assert.equal(body.title, "Updated Policy");
		assert.equal(body.code, `doc-${orgId}-updated`);
		assert.equal(body.text, "Updated text");
		assert.equal(body.version, 2);
		assert.equal(body.locale, "pt-PT");
		assert.equal(body.metadata.approvalCode, "BB");
		assert.equal(body.status, "inactive");
		assert.equal(body.date, date);
	});

	it("Should return Joi validation error for invalid request body", async () => {
		const { statusCode, body } = await server.put(`/v1/documents/${context.documentId}`).send({
			title: 1,
			code: 2,
			text: 3,
			version: "bad",
			locale: 4,
			metadata: "bad",
			status: "bad",
			date: "bad",
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.title[0]);
		assert.isString(body.validation.body.code[0]);
		assert.isString(body.validation.body.text[0]);
		assert.isString(body.validation.body.version[0]);
		assert.isString(body.validation.body.locale[0]);
		assert.isString(body.validation.body.metadata[0]);
		assert.isString(body.validation.body.status[0]);
		assert.isString(body.validation.body.date[0]);
	});

	it("Should return custom fields validation error for invalid metadata", async () => {
		const { statusCode, body } = await server.put(`/v1/documents/${context.documentId}`).send({
			metadata: {
				approvalCode: {
					invalid: true,
				},
			},
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.metadata.approvalCode[0]);
	});
});
