import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { seedDocumentCustomFields } from "../../../common/seed-custom-fields";

describe("GET /api/v1/documents", () => {
	const { server, context } = initTest();
	let orgId: number;
	let uniqueCode: string;

	beforeEach(async () => {
		orgId = Math.floor(Math.random() * 1000000) + 1;
		await seedDocumentCustomFields(orgId);

		uniqueCode = `contract-${Date.now()}`;
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
			metadata: "bad",
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
		assert.isString(body.validation.query.metadata[0]);
		assert.isString(body.validation.query.status[0]);
		assert.isString(body.validation.query.date[0]);
	});

	it("Should return document", async () => {
		const { statusCode, body } = await server.get("/v1/documents").query({
			"id[0]": context.documentId,
			orgId,
			title: "Contract",
			version: 1,
			metadata: {
				approvalCode: "OK",
			},
			status: "active",
		});
		assert.equal(statusCode, 200);
		assert.equal(body.data[0].id, context.documentId);
		assert.equal(body.data[0].orgId, orgId);
		assert.equal(body.data[0].title, "Contract");
		assert.equal(body.data[0].code, uniqueCode);
		assert.equal(body.data[0].version, 1);
		assert.equal(body.data[0].locale, "en-US");
		assert.equal(body.data[0].metadata.approvalCode, "OK");
		assert.isString(body.data[0].createdAt);
		assert.isString(body.data[0].updatedAt);
		assert.equal(body.data[0].status, "active");
		assert.isString(body.data[0].arn);
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
	});

	it("Should search with POST method", async () => {
		const { statusCode, body } = await server.post("/v1/documents/search").send({
			id: [context.documentId],
			orgId,
			metadata: {
				approvalCode: "OK",
			},
		});

		assert.equal(statusCode, 200);
		assert.lengthOf(body.data, 1);
		assert.equal(body.data[0].id, context.documentId);
		assert.equal(body.data[0].metadata.approvalCode, "OK");
		assert.equal(body.page, 1);
		assert.equal(body.limit, 20);
	});

	it("Should return document filtered by numeric metadata", async () => {
		const numericCode = `contract-${Date.now()}-number`;
		const { statusCode: createStatusCode, body: createdDocument } = await server.post("/v1/documents").send({
			orgId,
			region: "us",
			title: "Numeric Contract",
			code: numericCode,
			text: "Very long contract text",
			version: 1,
			locale: "en-US",
			metadata: {
				approvalCode: 10,
			},
			status: "active",
			date: new Date().toISOString(),
		});

		assert.equal(createStatusCode, 201);

		const { statusCode, body } = await server.get("/v1/documents").query({
			"id[0]": createdDocument.id,
			orgId,
			metadata: {
				approvalCode: 10,
			},
		});

		assert.equal(statusCode, 200);
		assert.lengthOf(body.data, 1);
		assert.equal(body.data[0].id, createdDocument.id);
		assert.equal(body.data[0].metadata.approvalCode, 10);
	});
});
