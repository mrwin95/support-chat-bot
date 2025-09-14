import { devConfig } from "./config/dev";
import { LoggingDecorator } from "./decorators/LoggingNetworkService";
import { AwsClientFactory } from "./factories/AwsClientFactory";
import { NetworkStack } from "./orchestrators/NetworkStack";
import { SecurityGroupService } from "./services/SecurityGroupService";
import { SubnetService } from "./services/SubnetService";
import { VpcService } from "./services/VpcService";

(async () => {
  const ec2Client = AwsClientFactory.createEC2(devConfig.region);
  const vpcService = new LoggingDecorator(new VpcService(ec2Client));
  const subnetService = new SubnetService(ec2Client);
  const sgService = new SecurityGroupService(ec2Client);

  const networkStack = new NetworkStack(vpcService, subnetService, sgService);
  // 1. Create vpc
  // provision dev
  const vpcId = await networkStack.provision(devConfig);
  console.log("Dev stack provisioned with vpc: ", vpcId);
})();
