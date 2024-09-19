import { autoInjectable, inject } from "@structured-growth/microservice-sdk";
import { AgreementsRepository } from "./agreements.repository";

@autoInjectable()
export class AgreementsService {
	constructor(@inject("AgreementsRepository") private agreementRepository: AgreementsRepository) {}
}
