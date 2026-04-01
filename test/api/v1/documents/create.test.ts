import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { seedDocumentCustomFields } from "../../../common/seed-custom-fields";

describe("POST /api/v1/documents", () => {
	const { server } = initTest();
	let orgId: number;

	beforeEach(async () => {
		orgId = Math.floor(Math.random() * 1000000) + 1;
		await seedDocumentCustomFields(orgId);
	});

	it("Should create document", async () => {
		const date = new Date().toISOString();

		const { statusCode, body } = await server.post("/v1/documents").send({
			orgId,
			region: "us",
			title: "Terms",
			code: `doc-${orgId}-create`,
			text: "Hello",
			version: 1,
			locale: "en-US",
			metadata: {
				approvalCode: "OK",
			},
			status: "active",
			date,
		});

		assert.equal(statusCode, 201);
		assert.isNumber(body.id);
		assert.equal(body.orgId, orgId);
		assert.equal(body.region, "us");
		assert.equal(body.title, "Terms");
		assert.equal(body.code, `doc-${orgId}-create`);
		assert.equal(body.text, "Hello");
		assert.equal(body.version, 1);
		assert.equal(body.locale, "en-US");
		assert.equal(body.metadata.approvalCode, "OK");
		assert.equal(body.status, "active");
		assert.equal(body.date, date);
		assert.isString(body.createdAt);
		assert.isString(body.updatedAt);
		assert.isString(body.arn);
	});

	it("Should return Joi validation error for invalid request body", async () => {
		const { statusCode, body } = await server.post("/v1/documents").send({
			orgId: "bad",
			region: "u",
			title: 1,
			code: 2,
			text: 3,
			version: "bad",
			locale: 4,
			metadata: "bad",
			status: "bad",
			date: "bad",
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.orgId[0]);
		assert.isString(body.validation.body.region[0]);
		assert.isString(body.validation.body.title[0]);
		assert.isString(body.validation.body.code[0]);
		assert.isString(body.validation.body.text[0]);
		assert.isString(body.validation.body.version[0]);
		assert.isString(body.validation.body.locale[0]);
		assert.isString(body.validation.body.metadata[0]);
		assert.isString(body.validation.body.status[0]);
		assert.isString(body.validation.body.date[0]);
	});

	it("Should return custom fields validation error for invalid metadata", async () => {
		const { statusCode, body } = await server.post("/v1/documents").send({
			orgId,
			region: "us",
			title: "Terms",
			code: `doc-${orgId}-invalid-metadata`,
			text: "Hello",
			version: 1,
			metadata: {
				approvalCode: {
					invalid: true,
				},
			},
			status: "active",
			date: new Date().toISOString(),
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.metadata.approvalCode[0]);
	});

});
