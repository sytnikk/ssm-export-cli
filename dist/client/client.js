"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ssm_1 = __importDefault(require("aws-sdk/clients/ssm"));
const credential_provider_sso_1 = require("@aws-sdk/credential-provider-sso");
const parser_1 = require("./utils/parser");
class Client {
    static async create(ssoprofile) {
        console.log(`✔ Using ${ssoprofile ? 'sso ' : ''}profile ${ssoprofile || 'default'}`);
        let credentials;
        const client = new Client();
        if (ssoprofile) {
            credentials = await credential_provider_sso_1.fromSSO({ profile: ssoprofile })();
        }
        client.client = new ssm_1.default(credentials ? { credentials } : {});
        return client;
    }
    async fetch(requestParameters, SSMParameters = []) {
        const { NextToken, Parameters = [] } = await this.client
            .getParametersByPath(requestParameters)
            .promise();
        const parameters = [...Parameters, ...SSMParameters];
        if (NextToken) {
            return this.fetch({
                ...requestParameters,
                NextToken,
            }, parameters);
        }
        return parser_1.parseParameters(parameters);
    }
    async getParametersByPath(path) {
        return this.fetch({
            Path: path,
            WithDecryption: true,
            Recursive: true,
        });
    }
}
exports.default = Client;
//# sourceMappingURL=client.js.map