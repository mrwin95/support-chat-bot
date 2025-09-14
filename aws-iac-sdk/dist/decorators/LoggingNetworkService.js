"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingNetworkService = void 0;
class LoggingNetworkService {
    service;
    constructor(service) {
        this.service = service;
    }
    async createVpc(cidrBlock, name) {
        console.log(`[LOG] Creating VPC ${name} with CIDR ${cidrBlock}`);
        const id = await this.createVpc(cidrBlock, name);
        console.log(`[LOG] Created VPC ${id}`);
        return id;
    }
    listVpcs() {
        throw new Error("Method not implemented.");
    }
    deleteVpc(vpcId) {
        throw new Error("Method not implemented.");
    }
}
exports.LoggingNetworkService = LoggingNetworkService;
//# sourceMappingURL=LoggingNetworkService.js.map