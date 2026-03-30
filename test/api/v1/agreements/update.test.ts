import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { seedAgreementCustomFields } from "../../../common/seed-custom-fields";

describe("PUT /api/v1/agreements/:agreementId", () => {
	const { server, context } = initTest();
	const orgId = Math.floor(Math.random() * 1000000) + 1;

	beforeEach(async () => {
		await seedAgreementCustomFields(orgId);

		const document = await server.post("/v1/documents").send({
			orgId,
			region: "us",
			title: "Agreement Update Source",
			code: `agreement-doc-${orgId}-update`,
			text: "Text",
			version: 1,
			status: "active",
			date: new Date().toISOString(),
		});

		const agreement = await server.post("/v1/agreements").send({
			orgId,
			region: "us",
			documentId: document.body.id,
			accountId: 11,
			userId: 22,
			metadata: {
				signSource: "app",
			},
			status: "active",
			date: new Date().toISOString(),
		});

		context.agreementId = agreement.body.id;
	});

	it("Should update metadata", async () => {
		const { statusCode, body } = await server.put(`/v1/agreements/${context.agreementId}`).send({
			metadata: {
				signSource: "portal",
			},
		});

		assert.equal(statusCode, 200);
		assert.equal(body.metadata.signSource, "portal");
	});

	it("Should return validation error for invalid metadata", async () => {
		const { statusCode, body } = await server.put(`/v1/agreements/${context.agreementId}`).send({
			metadata: {
				signSource: 100,
			},
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.metadata.signSource[0]);
	});

	it("Should allow null metadata", async () => {
		const { statusCode, body } = await server.put(`/v1/agreements/${context.agreementId}`).send({
			metadata: null,
		});

		assert.equal(statusCode, 200);
		assert.isNull(body.metadata);
	});
});
