import { RegionEnum } from "@structured-growth/microservice-sdk";
export interface AgreementCreateBodyInterface {
	orgId: number;
	region: RegionEnum;
	documentId: number;
	accountId: number;
	userId: number;
	status: "active" | "inactive";
	date: Date;
}
