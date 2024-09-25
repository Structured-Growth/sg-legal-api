/**
* IMPORTANT NOTE!
* This file was auto-generated with tsoa.
* Please do not modify it. Re-run tsoa to re-generate this file
*/

import { Router } from "express";
import { container, handleRequest } from "@structured-growth/microservice-sdk";
import * as Controllers from "../controllers/v1";

const handlerOpts = {
    logRequestBody: container.resolve<boolean>('logRequestBody'),
    logResponses: container.resolve<boolean>('logResponses'),
}

export const router = Router();
const pathPrefix = process.env.URI_PATH_PREFIX || '';

//SystemController
router.post(pathPrefix + '/v1/system/migrate', handleRequest(Controllers.SystemController, "migrate", handlerOpts));

//PingController
router.get(pathPrefix + '/v1/ping/alive', handleRequest(Controllers.PingController, "pingGet", handlerOpts));

//DocumentsController
router.get(pathPrefix + '/v1/documents', handleRequest(Controllers.DocumentsController, "search", handlerOpts));
router.post(pathPrefix + '/v1/documents/search', handleRequest(Controllers.DocumentsController, "searchPost", handlerOpts));
router.post(pathPrefix + '/v1/documents', handleRequest(Controllers.DocumentsController, "create", handlerOpts));
router.get(pathPrefix + '/v1/documents/:documentId', handleRequest(Controllers.DocumentsController, "get", handlerOpts));
router.put(pathPrefix + '/v1/documents/:documentId', handleRequest(Controllers.DocumentsController, "update", handlerOpts));
router.delete(pathPrefix + '/v1/documents/:documentId', handleRequest(Controllers.DocumentsController, "delete", handlerOpts));

//AgreementsController
router.get(pathPrefix + '/v1/agreements', handleRequest(Controllers.AgreementsController, "search", handlerOpts));
router.post(pathPrefix + '/v1/agreements/search', handleRequest(Controllers.AgreementsController, "searchPost", handlerOpts));
router.post(pathPrefix + '/v1/agreements', handleRequest(Controllers.AgreementsController, "create", handlerOpts));
router.get(pathPrefix + '/v1/agreements/:agreementId', handleRequest(Controllers.AgreementsController, "get", handlerOpts));
router.put(pathPrefix + '/v1/agreements/:agreementId', handleRequest(Controllers.AgreementsController, "update", handlerOpts));
router.delete(pathPrefix + '/v1/agreements/:agreementId', handleRequest(Controllers.AgreementsController, "delete", handlerOpts));

//ResolverController
router.get(pathPrefix + '/v1/resolver/resolve', handleRequest(Controllers.ResolverController, "resolve", handlerOpts));
router.get(pathPrefix + '/v1/resolver/actions', handleRequest(Controllers.ResolverController, "actions", handlerOpts));
router.get(pathPrefix + '/v1/resolver/models', handleRequest(Controllers.ResolverController, "models", handlerOpts));

// map is required for correct resolving action by route
export const actionToRouteMap = {
	"SystemController.migrate": 'post /v1/system/migrate',
	"PingController.pingGet": 'get /v1/ping/alive',
	"DocumentsController.search": 'get /v1/documents',
	"DocumentsController.searchPost": 'post /v1/documents/search',
	"DocumentsController.create": 'post /v1/documents',
	"DocumentsController.get": 'get /v1/documents/:documentId',
	"DocumentsController.update": 'put /v1/documents/:documentId',
	"DocumentsController.delete": 'delete /v1/documents/:documentId',
	"AgreementsController.search": 'get /v1/agreements',
	"AgreementsController.searchPost": 'post /v1/agreements/search',
	"AgreementsController.create": 'post /v1/agreements',
	"AgreementsController.get": 'get /v1/agreements/:agreementId',
	"AgreementsController.update": 'put /v1/agreements/:agreementId',
	"AgreementsController.delete": 'delete /v1/agreements/:agreementId',
	"ResolverController.resolve": 'get /v1/resolver/resolve',
	"ResolverController.actions": 'get /v1/resolver/actions',
	"ResolverController.models": 'get /v1/resolver/models',
};
