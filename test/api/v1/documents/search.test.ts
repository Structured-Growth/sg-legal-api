import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { seedDocumentCustomFields } from "../../../common/seed-custom-fields";

describe("GET /api/v1/documents", () => {
	const { server, context } = initTest();
	const orgId = Math.floor(Math.random() * 1000000) + 1;
	const uniqueCode = `contract-${Date.now()}`;

	beforeEach(async () => {
		await seedDocumentCustomFields(orgId);
	});

	it("Should create document", async () => {
		const { statusCode, body } = await server.post("/v1/documents").send({
			orgId,
			region: "us",
			title: "Contract",
			code: uniqueCode,
			text: "Very long contract text",
			version: 1,
			locale: "en-US",
			metadata: {
				approvalCode: "OK",
			},
			status: "active",
			date: new Date().toISOString(),
		});
		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		context["documentId"] = body.id;
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get("/v1/documents").query({
			orgId: "a",
			title: null,
			code: null,
			version: "version",
			locale: "en-US",
			date: 21,
			id: -1,
			arn: 1,
			page: "b",
			limit: false,
			sort: "createdAt:asc",
			"status[0]": "superstatus",
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.query.id[0]);
		assert.isString(body.validation.query.orgId[0]);
		assert.isString(body.validation.query.title[0]);
		assert.isString(body.validation.query.arn[0]);
		assert.isString(body.validation.query.code[0]);
		assert.isString(body.validation.query.version[0]);
		assert.isString(body.validation.query.status[0]);
		assert.isString(body.validation.query.date[0]);
	});

	it("Should return document", async () => {
		const { statusCode, body } = await server.get("/v1/documents").query({
			"id[0]": context.documentId,
			orgId,
			title: "Contract",
			version: 1,
			status: "active",
		});
		assert.equal(statusCode, 200);
		assert.equal(body.data[0].id, context.documentId);
		assert.equal(body.data[0].orgId, orgId);
		assert.equal(body.data[0].title, "Contract");
		assert.equal(body.data[0].code, uniqueCode);
		assert.equal(body.data[0].version, 1);
		assert.equal(body.data[0].locale, "en-US");
		assert.isString(body.data[0].createdAt);
		assert.isString(body.data[0].updatedAt);
		assert.equal(body.data[0].status, "active");
		assert.isString(body.data[0].arn);
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
	});

	it("Should return document filtered by metadata with GET", async () => {
		const { statusCode, body } = await server.get("/v1/documents").query({
			"id[0]": context.documentId,
			metadata: JSON.stringify({
				approvalCode: "OK",
			}),
		});

		assert.equal(statusCode, 200);
		assert.lengthOf(body.data, 1);
		assert.equal(body.data[0].id, context.documentId);
		assert.equal(body.data[0].metadata.approvalCode, "OK");
	});

	it("Should search with POST method", async () => {
		const { statusCode, body } = await server.post("/v1/documents/search").send({
			id: [context.documentId],
			orgId,
			metadata: JSON.stringify({
				approvalCode: "OK",
			}),
		});

		assert.equal(statusCode, 200);
		assert.lengthOf(body.data, 1);
		assert.equal(body.data[0].id, context.documentId);
		assert.equal(body.data[0].metadata.approvalCode, "OK");
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
	});
});
