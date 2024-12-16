import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("GET /api/v1/agreements", () => {
	const { server, context } = initTest();
	const uniqueCode = `contract-${Date.now()}`;

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

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.get("/v1/agreements").query({
			orgId: "a",
			documentId: 0,
			accountId: 0,
			userId: 0,
			id: -1,
			arn: 1,
			page: "b",
			limit: false,
			sort: "createdAt:asc",
			"status[0]": "superstatus",
			date: 21,
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.query.id[0]);
		assert.isString(body.validation.query.orgId[0]);
		assert.isString(body.validation.query.documentId[0]);
		assert.isString(body.validation.query.accountId[0]);
		assert.isString(body.validation.query.arn[0]);
		assert.isString(body.validation.query.userId[0]);
		assert.isString(body.validation.query.status[0]);
		assert.isString(body.validation.query.date[0]);
	});

	it("Should return agreement", async () => {
		const { statusCode, body } = await server.get("/v1/agreements").query({
			"id[0]": context.agreementId,
			orgId: 49,
			"documentId[0]": context.documentId,
			accountId: 45,
			userId: 15,
			status: "active",
		});
		assert.equal(statusCode, 200);
		assert.equal(body.data[0].id, context.agreementId);
		assert.equal(body.data[0].orgId, 49);
		assert.equal(body.data[0].documentId, context.documentId);
		assert.equal(body.data[0].accountId, 45);
		assert.equal(body.data[0].userId, 15);
		assert.isString(body.data[0].createdAt);
		assert.isString(body.data[0].updatedAt);
		assert.equal(body.data[0].status, "active");
		assert.isString(body.data[0].date);
		assert.isString(body.data[0].arn);
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
	});

	it("Should search with POST method", async () => {
		const { statusCode, body } = await server.post("/v1/agreements/search").send({
			id: [context.agreementId],
			orgId: 49,
			documentId: [context.documentId],
			accountId: 45,
			userId: 15,
			status: "active",
		});
		assert.equal(statusCode, 200);
		assert.equal(body.data[0].id, context.agreementId);
		assert.equal(body.data[0].orgId, 49);
		assert.equal(body.data[0].documentId, context.documentId);
		assert.equal(body.data[0].accountId, 45);
		assert.equal(body.data[0].userId, 15);
		assert.isString(body.data[0].createdAt);
		assert.isString(body.data[0].updatedAt);
		assert.equal(body.data[0].status, "active");
		assert.isString(body.data[0].date);
		assert.isString(body.data[0].arn);
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
	});
});
