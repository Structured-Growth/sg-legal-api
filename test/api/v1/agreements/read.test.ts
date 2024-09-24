import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";

describe("GET /api/v1/agreements/:agreementId", () => {
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

	it("Should read agreement", async () => {
		const { statusCode, body } = await server.get(`/v1/agreements/${context.agreementId}`);
		assert.equal(statusCode, 200);
		assert.equal(body.id, context.agreementId);
		assert.equal(body.orgId, 49);
		assert.equal(body.documentId, context.documentId);
		assert.equal(body.accountId, 45);
		assert.equal(body.userId, 15);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.equal(body.status, "active");
		assert.isString(body.date);
		assert.isString(body.arn);
	});

	it("Should return is agreement does not exist", async () => {
		const { statusCode, body } = await server.get(`/v1/agreements/999999`).send({});
		assert.equal(statusCode, 404);
		assert.equal(body.name, "NotFound");
		assert.isString(body.message);
	});

	it("Should return validation error if id is wrong", async () => {
		const { statusCode, body } = await server.get(`/v1/agreements/wrong`).send({});
		assert.equal(statusCode, 422);
		assert.isString(body.message);
	});
});
