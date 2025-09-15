import * as ec2 from "aws-cdk-lib/aws-ec2";
import { ISubnetConfig } from "./ISubnetConfig";
export interface INetworkConfig {
  ipAddresses: ec2.IIpAddresses;
  maxAzs: number;
  natGateways: number;
  //   subnetConfiguration: ISubnetConfig[];
}
