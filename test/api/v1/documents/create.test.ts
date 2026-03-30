import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { seedDocumentCustomFields } from "../../../common/seed-custom-fields";

describe("POST /api/v1/documents", () => {
	const { server } = initTest();
	const orgId = Math.floor(Math.random() * 1000000) + 1;

	beforeEach(() => seedDocumentCustomFields(orgId));

	it("Should create document with metadata", async () => {
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
			date: new Date().toISOString(),
		});

		assert.equal(statusCode, 201);
		assert.equal(body.metadata.approvalCode, "OK");
	});

	it("Should return validation error for invalid metadata", async () => {
		const { statusCode, body } = await server.post("/v1/documents").send({
			orgId,
			region: "us",
			title: "Terms",
			code: `doc-${orgId}-invalid`,
			text: "Hello",
			version: 1,
			metadata: {
				approvalCode: 1,
			},
			status: "active",
			date: new Date().toISOString(),
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.metadata.approvalCode[0]);
	});

	it("Should allow null metadata", async () => {
		const { statusCode, body } = await server.post("/v1/documents").send({
			orgId,
			region: "us",
			title: "Terms",
			code: `doc-${orgId}-null`,
			text: "Hello",
			version: 1,
			metadata: null,
			status: "active",
			date: new Date().toISOString(),
		});

		assert.equal(statusCode, 201);
		assert.isNull(body.metadata);
	});
});
