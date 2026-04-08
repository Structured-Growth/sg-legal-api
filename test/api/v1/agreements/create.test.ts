import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { seedAgreementCustomFields } from "../../../common/seed-custom-fields";

describe("POST /api/v1/agreements", () => {
	const { server, context } = initTest();
	let orgId: number;

	beforeEach(async () => {
		orgId = Math.floor(Math.random() * 1000000) + 1;
		await seedAgreementCustomFields(orgId);

		const { body } = await server.post("/v1/documents").send({
			orgId,
			region: "us",
			title: "Agreement Source",
			code: `agreement-doc-${orgId}-create`,
			text: "Text",
			version: 1,
			status: "active",
			date: new Date().toISOString(),
		});

		context.documentId = body.id;
	});

	it("Should create agreement", async () => {
		const date = new Date().toISOString();

		const { statusCode, body } = await server.post("/v1/agreements").send({
			orgId,
			region: "us",
			documentId: context.documentId,
			accountId: 1,
			userId: 2,
			metadata: {
				signSource: "web",
			},
			status: "active",
			date,
		});

		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.equal(body.orgId, orgId);
		assert.equal(body.region, "us");
		assert.equal(body.documentId, context.documentId);
		assert.equal(body.accountId, 1);
		assert.equal(body.userId, 2);
		assert.equal(body.metadata.signSource, "web");
		assert.equal(body.status, "active");
		assert.equal(body.date, date);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.isString(body.arn);
	});

	it("Should return Joi validation error for invalid request body", async () => {
		const { statusCode, body } = await server.post("/v1/agreements").send({
			orgId: "bad",
			region: "u",
			documentId: "bad",
			accountId: "bad",
			userId: "bad",
			metadata: "bad",
			status: "bad",
			date: "bad",
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.orgId[0]);
		assert.isString(body.validation.body.region[0]);
		assert.isString(body.validation.body.documentId[0]);
		assert.isString(body.validation.body.accountId[0]);
		assert.isString(body.validation.body.userId[0]);
		assert.isString(body.validation.body.metadata[0]);
		assert.isString(body.validation.body.status[0]);
		assert.isString(body.validation.body.date[0]);
	});

	it("Should return custom fields validation error for invalid metadata", async () => {
		const { statusCode, body } = await server.post("/v1/agreements").send({
			orgId,
			region: "us",
			documentId: context.documentId,
			accountId: 1,
			userId: 2,
			metadata: {
				signSource: {
					invalid: true,
				},
			},
			status: "active",
			date: new Date().toISOString(),
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.metadata.signSource[0]);
	});
});
