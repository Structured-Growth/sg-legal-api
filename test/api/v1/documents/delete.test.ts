import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("DELETE /api/v1/documents/:documentId", () => {
	const { server, context } = initTest();

	it("Should create document", async () => {
		const uniqueCode = `contract-${Date.now()}`;

		const { statusCode, body } = await server.post("/v1/documents").send({
			orgId: 49,
			region: "us",
			title: "Contract",
			code: uniqueCode,
			text: "Very long contract text",
			version: 1,
			locale: "en-US",
			status: "active",
			date: new Date().toISOString(),
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		context["documentId"] = body.id;
	});

	it("Should delete document", async () => {
		const { statusCode, body } = await server.delete(`/v1/documents/${context.documentId}`);
		assert.equal(statusCode, 204);
	});

	it("Should return if document does not exist", async () => {
		const { statusCode, body } = await server.delete(`/v1/documents/${context.documentId}`);
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.delete(`/v1/documents/wrong`);
		assert.equal(statusCode, 422);
		assert.isString(body.message);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.documentId[0]);
	});
});
