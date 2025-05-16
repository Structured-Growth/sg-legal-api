import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("POST /api/v1/documents", () => {
	const { server, context } = initTest();

	it("Should create document with locale", async () => {
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
		assert.equal(body.orgId, 49);
		assert.equal(body.region, "us");
		assert.equal(body.title, "Contract");
		assert.equal(body.code, uniqueCode);
		assert.equal(body.text, "Very long contract text");
		assert.equal(body.version, 1);
		assert.equal(body.locale, "en-US");
		assert.isNotNaN(new Date(body.createdAt).getTime());
		assert.isNotNaN(new Date(body.updatedAt).getTime());
		assert.equal(body.status, "active");
		assert.isNotNaN(new Date(body.date).getTime());
		assert.isString(body.arn);
	});

	it("Should create document without locale", async () => {
		const uniqueCode = `contract-${Date.now()}`;

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
		assert.equal(body.orgId, 49);
		assert.equal(body.region, "us");
		assert.equal(body.title, "Contract");
		assert.equal(body.code, uniqueCode);
		assert.equal(body.text, "Very long contract text");
		assert.equal(body.version, 1);
		assert.equal(body.locale, null);
		assert.isNotNaN(new Date(body.createdAt).getTime());
		assert.isNotNaN(new Date(body.updatedAt).getTime());
		assert.equal(body.status, "active");
		assert.isNotNaN(new Date(body.date).getTime());
		assert.isString(body.arn);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.post("/v1/documents").send({
			orgId: "orgId",
			region: 25,
			title: 78,
			code: 33,
			text: 12,
			version: "version",
			status: "pending",
			date: "date",
		});

		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.orgId[0]);
		assert.isString(body.validation.body.region[0]);
		assert.isString(body.validation.body.title[0]);
		assert.isString(body.validation.body.code[0]);
		assert.isString(body.validation.body.text[0]);
		assert.isString(body.validation.body.version[0]);
		assert.isString(body.validation.body.status[0]);
		assert.isString(body.validation.body.date[0]);
	});

	it("Should return validation error if document with same code and version already exists", async () => {
		const duplicateCode = `duplicate-code-${Date.now()}`;
		const documentPayload = {
			orgId: 49,
			region: "us",
			title: "Duplicate Document",
			code: duplicateCode,
			text: "Some text",
			version: 1,
			locale: "en-US",
			status: "active",
			date: new Date().toISOString(),
		};

		const { statusCode: firstStatus } = await server.post("/v1/documents").send(documentPayload);
		assert.equal(firstStatus, 201);

		const { statusCode: secondStatus, body: errorBody } = await server.post("/v1/documents").send(documentPayload);
		assert.equal(secondStatus, 422);
		assert.equal(errorBody.name, "ValidationError");
		assert.deepEqual(errorBody.validation?.documentId, [
			"A document with this code, version, orgId and locale has already been created.",
		]);
	});
});
