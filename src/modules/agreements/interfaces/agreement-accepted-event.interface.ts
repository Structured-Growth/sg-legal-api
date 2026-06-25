import { RegionEnum } from "@structured-growth/microservice-sdk";

export interface AgreementAcceptedEventInterface {
	orgId: number;
	region: RegionEnum;
	documentId: number;
	accountId: number;
	userId: number;
	agreementId: number;
	language: string;
	createdAt: string;
}
