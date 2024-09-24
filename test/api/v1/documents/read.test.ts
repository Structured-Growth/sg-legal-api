import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("GET /api/v1/documents/:documentId", () => {
	const { server, context } = initTest();
	const uniqueCode = `contract-${Date.now()}`;

	it("Should create document", async () => {
		const { statusCode, body } = await server.post("/v1/documents").send({
			orgId: 49,
			region: "us",
			title: "Contract",
			code: uniqueCode,
			text: "Very long contract text",
			version: 1,
			status: "active",
			date: new Date().toISOString(),
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		context["documentId"] = body.id;
	});

	it("Should read document", async () => {
		const { statusCode, body } = await server.get(`/v1/documents/${context.documentId}`);
		assert.equal(statusCode, 200);
		assert.equal(body.id, context.documentId);
		assert.equal(body.orgId, 49);
		assert.equal(body.title, "Contract");
		assert.equal(body.code, uniqueCode);
		assert.equal(body.text, "Very long contract text");
		assert.equal(body.version, 1);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.equal(body.status, "active");
		assert.isString(body.date);
		assert.isString(body.arn);
	});

	it("Should return is document does not exist", async () => {
		const { statusCode, body } = await server.get(`/v1/documents/999999`).send({});
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.get(`/v1/documents/wrong`).send({});
		assert.equal(statusCode, 422);
		assert.isString(body.message);
	});
});
