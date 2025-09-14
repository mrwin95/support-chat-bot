import { SubnetConfig } from "./SubnetConfig";
import { VpcConfig } from "./VpcConfig";

export interface EnvConfig {
  name: string;
  accountId: string;
  roleArn: string;
  region: string;
  vpc: VpcConfig;
  subnets: SubnetConfig[];
}
