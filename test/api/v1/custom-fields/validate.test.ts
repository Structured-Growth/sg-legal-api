import "../../../../src/app/providers";
import { assert } from "chai";
import { initTest } from "../../../common/init-test";
import { seedDocumentCustomFields } from "../../../common/seed-custom-fields";

describe("POST /api/v1/custom-fields/validate", () => {
	const { server } = initTest();
	let orgId: number;

	beforeEach(async () => {
		orgId = Math.floor(Math.random() * 1000000) + 1;
		await seedDocumentCustomFields(orgId);
	});

	it("Should return successful validation result", async () => {
		const { statusCode, body } = await server.post("/v1/custom-fields/validate").send({
			entity: "Document",
			orgId,
			data: {
				approvalCode: "OK",
			},
		});

		assert.equal(statusCode, 200);
		assert.equal(body.valid, true);
		assert.isUndefined(body.errors);
	});

	it("Should return validation result with errors", async () => {
		const { statusCode, body } = await server.post("/v1/custom-fields/validate").send({
			entity: "Document",
			orgId,
			data: {
				approvalCode: {
					invalid: true,
				},
			},
		});

		assert.equal(statusCode, 200);
		assert.equal(body.valid, false);
		assert.isString(body.errors.approvalCode[0]);
	});
});
