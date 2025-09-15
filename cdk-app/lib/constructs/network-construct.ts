import { Construct } from "constructs";
import { INetworkConfig } from "../interfaces/INetworkConfig";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { SubnetConstruct } from "./subnet-construct";
export class NetworkConstruct extends Construct {
  public readonly vpc: ec2.Vpc;
  constructor(scope: Construct, id: string, config: INetworkConfig) {
    super(scope, id);

    // const subnetConstruct = new SubnetConstruct(this, "Subnets", "10.40.0.0/16");

    this.vpc = new ec2.Vpc(this, "Vpc", {
      ipAddresses: config.ipAddresses,
      maxAzs: config.maxAzs,
      natGateways: config.natGateways,
      subnetConfiguration: [
        {
          name: "public-subnet",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 20,
        },
        {
          name: "private-subnet",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 19,
        },
      ],
    });
  }
}
