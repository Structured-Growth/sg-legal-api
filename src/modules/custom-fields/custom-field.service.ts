import {
	autoInjectable,
	inject,
	joi,
	validate,
	ValidationError,
	SearchResultInterface,
} from "@structured-growth/microservice-sdk";
import { Op } from "sequelize";
import CustomField from "../../../database/models/custom-field";
import { CustomFieldSearchParamsInterface } from "../../interfaces/custom-field-search-params.interface";
import { CustomFieldRepository } from "./custom-field.repository";

@autoInjectable()
export class CustomFieldService {
	constructor(@inject("CustomFieldRepository") private customFieldRepository: CustomFieldRepository) {}

	public async search(
		params: CustomFieldSearchParamsInterface,
		parentOrgIds: number[] = []
	): Promise<SearchResultInterface<CustomField>> {
		const orgIds = params.includeInherited === false ? [params.orgId] : [params.orgId, ...parentOrgIds];

		return this.customFieldRepository.search({
			...params,
			orgId: orgIds,
		});
	}

	public async validate(
		entityName: string,
		data: Record<string, unknown> | null | undefined,
		orgIds: number[] = [],
		throwError = true
	): Promise<{
		valid: boolean;
		message?: string;
		errors?: object;
	}> {
		const customFields = await CustomField.findAll({
			where: {
				entity: entityName,
				orgId: {
					[Op.or]: orgIds,
				},
			},
		});
		const validator = joi.object(
			customFields.reduce((acc, item) => {
				acc[item.name] = joi.build(item.schema);
				return acc;
			}, {})
		);

		const { valid, message, errors } = await validate(validator, data ?? {});

		if (!valid && throwError) {
			throw new ValidationError({
				body: {
					metadata: errors,
				},
			});
		}

		return { valid, message, errors };
	}
}
