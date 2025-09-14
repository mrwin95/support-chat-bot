"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LoggingNetworkService_1 = require("./decorators/LoggingNetworkService");
const VpcService_1 = require("./services/VpcService");
(async () => {
    const vpcService = new LoggingNetworkService_1.LoggingNetworkService(new VpcService_1.VpcService("ap-south-1"));
    // 1. Create vpc
    const vpcId = await vpcService.createVpc("10.20.0.0/16", "EKS-DEMO-VPC");
})();
//# sourceMappingURL=app.js.map