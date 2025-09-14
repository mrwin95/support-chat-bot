import { SubnetConfig } from "./SubnetConfig";
import { VpcConfig } from "./VpcConfig";

export interface EnvConfig {
  region: string;
  vpc: VpcConfig;
  subnets: SubnetConfig[];
}
