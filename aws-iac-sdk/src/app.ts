import { loadConfig } from "./config";
import { devConfig } from "./config/dev";
import { LoggingDecorator } from "./decorators/LoggingNetworkService";
import { AwsClientFactory } from "./factories/AwsClientFactory";
import { NetworkStack } from "./orchestrators/NetworkStack";
import { InternetGatewayService } from "./services/InternetGatewayService";
import { RouteTableService } from "./services/RouteTableService";
import { SecurityGroupService } from "./services/SecurityGroupService";
import { SubnetService } from "./services/SubnetService";
import { VpcService } from "./services/VpcService";

(async () => {
  const envConfig = loadConfig();
  const ec2Client = AwsClientFactory.createEC2(envConfig);

  //   const vpcService = ;
  //   const subnetService = new SubnetService(ec2Client);
  //   const sgService = new SecurityGroupService(ec2Client);

  const stack = new NetworkStack(
    new VpcService(ec2Client),
    new SubnetService(ec2Client),
    new SecurityGroupService(ec2Client),
    new InternetGatewayService(ec2Client),
    new RouteTableService(ec2Client)
  );
  // 1. Create vpc
  // provision dev
  const result = await stack.provision(devConfig);
  console.log(`✅ Provisioned ${envConfig.name} stack:`, result);
})();
