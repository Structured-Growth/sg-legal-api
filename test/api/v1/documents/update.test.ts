import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("PUT /api/v1/documents/:documentId", () => {
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
			locale: "en-US",
			status: "active",
			date: new Date().toISOString(),
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		context["documentId"] = body.id;
	});

	it("Should update document", async () => {
		const { statusCode, body } = await server.put(`/v1/documents/${context.documentId}`).send({
			title: "Contract for you.",
			code: uniqueCode + 25,
			text: "Very short contract text",
			version: 2,
			locale: "pt-BR",
			status: "archived",
			date: new Date().toISOString(),
		});
		assert.equal(statusCode, 200);
		assert.equal(body.id, context.documentId);
		assert.equal(body.orgId, 49);
		assert.equal(body.title, "Contract for you.");
		assert.equal(body.code, uniqueCode + 25);
		assert.equal(body.text, "Very short contract text");
		assert.equal(body.version, 2);
		assert.equal(body.locale, "pt-BR");
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.equal(body.status, "archived");
		assert.isString(body.date);
		assert.isString(body.arn);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.put(`/v1/documents/${context.documentId}`).send({
			title: 78,
			code: 25,
			text: 100,
			version: "version",
			locale: 21,
			status: "pending",
			date: 77,
		});

		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.title[0]);
		assert.isString(body.validation.body.code[0]);
		assert.isString(body.validation.body.text[0]);
		assert.isString(body.validation.body.version[0]);
		assert.isString(body.validation.body.locale[0]);
		assert.isString(body.validation.body.status[0]);
		assert.isString(body.validation.body.date[0]);
	});

	it("Should return validation error if document id is wrong", async () => {
		const { statusCode, body } = await server.put(`/v1/documents/9999`).send({});
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if document id is wrong", async () => {
		const { statusCode, body } = await server.put(`/v1/documents/stringid`).send({});
		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
	});
});
