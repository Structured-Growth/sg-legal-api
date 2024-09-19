import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("POST /api/v1/agreements", () => {
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
		assert.equal(body.orgId, 49);
		assert.equal(body.region, "us");
		assert.equal(body.documentId, context.documentId);
		assert.equal(body.accountId, 45);
		assert.equal(body.userId, 15);
		assert.isNotNaN(new Date(body.createdAt).getTime());
		assert.isNotNaN(new Date(body.updatedAt).getTime());
		assert.equal(body.status, "active");
		assert.isNotNaN(new Date(body.date).getTime());
		assert.isString(body.arn);
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.post("/v1/agreements").send({
			orgId: "orgId",
			region: 25,
			documentId: "documentId",
			accountId: "accountId",
			userId: "userId",
			status: "pending",
			date: "date",
		});

		assert.equal(statusCode, 422);
		assert.isDefined(body.validation);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.message);
		assert.isString(body.validation.body.orgId[0]);
		assert.isString(body.validation.body.region[0]);
		assert.isString(body.validation.body.documentId[0]);
		assert.isString(body.validation.body.accountId[0]);
		assert.isString(body.validation.body.userId[0]);
		assert.isString(body.validation.body.status[0]);
		assert.isString(body.validation.body.date[0]);
	});
});
