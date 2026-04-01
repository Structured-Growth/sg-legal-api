import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { seedAgreementCustomFields } from "../../../common/seed-custom-fields";

describe("PUT /api/v1/agreements/:agreementId", () => {
	const { server, context } = initTest();
	let orgId: number;

	beforeEach(async () => {
		orgId = Math.floor(Math.random() * 1000000) + 1;
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

	it("Should update agreement", async () => {
		const date = new Date().toISOString();

		const { statusCode, body } = await server.put(`/v1/agreements/${context.agreementId}`).send({
			metadata: {
				signSource: "portal",
			},
			status: "inactive",
			date,
		});

		assert.equal(statusCode, 200);
		assert.equal(body.metadata.signSource, "portal");
		assert.equal(body.status, "inactive");
		assert.equal(body.date, date);
	});

	it("Should return Joi validation error for invalid request body", async () => {
		const { statusCode, body } = await server.put(`/v1/agreements/${context.agreementId}`).send({
			metadata: "bad",
			status: "bad",
			date: "bad",
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.metadata[0]);
		assert.isString(body.validation.body.status[0]);
		assert.isString(body.validation.body.date[0]);
	});

	it("Should return custom fields validation error for invalid metadata", async () => {
		const { statusCode, body } = await server.put(`/v1/agreements/${context.agreementId}`).send({
			metadata: {
				signSource: {
					invalid: true,
				},
			},
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.metadata.signSource[0]);
	});

});
