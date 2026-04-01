import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { customFieldAlternativesSchema } from "../../../common/custom-field-schema";

describe("PUT /api/v1/custom-fields/:customFieldId", () => {
	const { server, context } = initTest();
	const orgId = Math.floor(Math.random() * 1000000) + 1;

	it("Should create custom field", async () => {
		const { statusCode, body } = await server.post("/v1/custom-fields").send({
			orgId,
			entity: "Document",
			title: "Approval Code",
			name: "approvalCode",
			schema: customFieldAlternativesSchema,
			status: "active",
		});

		assert.equal(statusCode, 201);
		context.customFieldId = body.id;
	});

	it("Should update custom field", async () => {
		const { statusCode, body } = await server.put(`/v1/custom-fields/${context.customFieldId}`).send({
			entity: "Agreement",
			title: "Approval Source",
			name: "approvalSource",
			schema: customFieldAlternativesSchema,
			status: "inactive",
		});

		assert.equal(statusCode, 200);
		assert.equal(body.id, context.customFieldId);
		assert.equal(body.entity, "Agreement");
		assert.equal(body.title, "Approval Source");
		assert.equal(body.name, "approvalSource");
		assert.equal(body.schema.type, "alternatives");
		assert.equal(body.status, "inactive");
	});

	it("Should return validation error", async () => {
		const { statusCode, body } = await server.put(`/v1/custom-fields/${context.customFieldId}`).send({
			entity: 0,
			title: 1,
			name: 2,
			schema: "bad",
			status: "bad",
		});

		assert.equal(statusCode, 422);
		assert.equal(body.name, "ValidationError");
		assert.isString(body.validation.body.entity[0]);
		assert.isString(body.validation.body.title[0]);
		assert.isString(body.validation.body.name[0]);
		assert.isString(body.validation.body.schema[0]);
		assert.isString(body.validation.body.status[0]);
	});
});
