import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { seedAgreementCustomFields } from "../../../common/seed-custom-fields";

describe("POST /api/v1/agreements", () => {
	const { server, context } = initTest();
	const orgId = Math.floor(Math.random() * 1000000) + 1;

	beforeEach(async () => {
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

	it("Should create agreement with metadata", async () => {
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
			date: new Date().toISOString(),
		});

		assert.equal(statusCode, 201);
		assert.equal(body.metadata.signSource, "web");
	});

	it("Should return validation error for invalid metadata", async () => {
		const { statusCode, body } = await server.post("/v1/agreements").send({
			orgId,
			region: "us",
			documentId: context.documentId,
			accountId: 1,
			userId: 2,
			metadata: {
				signSource: 1,
			},
			status: "active",
			date: new Date().toISOString(),
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.metadata.signSource[0]);
	});
});
