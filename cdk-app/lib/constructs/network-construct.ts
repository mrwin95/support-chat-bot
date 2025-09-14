import { Construct } from "constructs";
import { INetworkConfig } from "../interfaces/INetworkConfig";
import * as ec2 from "aws-cdk-lib/aws-ec2";
export class NetworkConstruct extends Construct {
  public readonly vpc: ec2.Vpc;
  constructor(scope: Construct, id: string, config: INetworkConfig) {
    super(scope, id);

    this.vpc = new ec2.Vpc(this, "Vpc", {
      cidr: config.cidr,
      maxAzs: config.maxAzs,
      natGateways: config.natGateways,
    });
  }
}
