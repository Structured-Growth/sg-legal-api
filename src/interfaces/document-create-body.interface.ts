import { RegionEnum } from "@structured-growth/microservice-sdk";
export interface DocumentCreateBodyInterface {
	orgId: number;
	region: RegionEnum;
	title: string;
	code: string;
	text: string;
	version: number;
	status: "active" | "inactive";
	date: Date;
}
