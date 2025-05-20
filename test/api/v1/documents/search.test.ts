import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("GET /api/v1/documents", () => {
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
			orgId: 49,
			title: "Contract",
			code: uniqueCode,
			version: 1,
			"locale[0]": "en-US",
			status: "active",
		});
		assert.equal(statusCode, 200);
		assert.equal(body.data[0].id, context.documentId);
		assert.equal(body.data[0].orgId, 49);
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
});
