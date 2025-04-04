import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("POST /api/v1/agreements/check", () => {
	const { server, context } = initTest();
	const uniqueCode = `contract-${Date.now()}`;

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get("/v1/agreements/check").query({
			accountId: 0,
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.query.accountId[0]);
		assert.isString(body.validation.query.documentCode[0]);
	});

	it("Should create agreement", async () => {
		const { statusCode: statusCodeDocument, body: bodyDocument } = await server.post("/v1/documents").send({
			orgId: 49,
			region: "us",
			title: "Contract",
			code: uniqueCode,
			text: "Very long contract text",
			version: 1,
			status: "active",
			date: new Date().toISOString(),
		});

		assert.equal(statusCodeDocument, 201);
		assert.isNumber(bodyDocument.id);
		context["documentId"] = bodyDocument.id;

		const { statusCode, body } = await server.post("/v1/agreements").send({
			orgId: 49,
			region: "us",
			documentId: context.documentId,
			accountId: 45,
			userId: 15,
			status: "active",
			date: new Date().toISOString(),
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		context["agreementId"] = body.id;
	});

	it("Should return agreement and latest document by code", async () => {
		const { statusCode, body } = await server.get("/v1/agreements/check").query({
			accountId: 45,
			documentCode: uniqueCode,
		});

		assert.equal(statusCode, 200);

		assert.isObject(body.document);
		assert.equal(body.document.code, uniqueCode);
		assert.equal(body.document.id, context.documentId);

		assert.isObject(body.agreement);
		assert.equal(body.agreement.accountId, 45);
		assert.equal(body.agreement.documentId, context.documentId);
		assert.equal(body.agreement.id, context.agreementId);
	});

	it("Should return document and null agreement if agreement doesn't exist", async () => {
		const { statusCode, body } = await server.get("/v1/agreements/check").query({
			accountId: 999999,
			documentCode: uniqueCode,
		});

		assert.equal(statusCode, 200);

		assert.isObject(body.document);
		assert.equal(body.document.code, uniqueCode);

		assert.isNull(body.agreement);
	});

	it("Should return 404 if document with provided code is not found", async () => {
		const { statusCode, body } = await server.get("/v1/agreements/check").query({
			accountId: 123,
			documentCode: "non-existent-code-xyz",
		});

		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.include(body.message, "Document with code non-existent-code-xyz not found");
	});
});
