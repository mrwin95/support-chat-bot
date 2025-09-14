import { LoggingNetworkService } from "./decorators/LoggingNetworkService";
import { VpcService } from "./services/VpcService";

(async () => {
  const vpcService = new LoggingNetworkService(new VpcService("ap-south-1"));

  // 1. Create vpc
  const vpcId = await vpcService.createVpc("10.20.0.0/16", "EKS-DEMO-VPC");
})();
