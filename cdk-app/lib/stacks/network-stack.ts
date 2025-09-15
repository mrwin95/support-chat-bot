import { Stack, StackProps } from "aws-cdk-lib";
// import * as ec2 from "@aws-cdk/aws-ec2";
import { Construct } from "constructs";
import { NetworkConstruct } from "../constructs/network-construct";
import { INetworkConfig } from "../interfaces/INetworkConfig";
import * as ec2 from "aws-cdk-lib/aws-ec2";
// const networkConfig = loadnNetworkConfig();
export class NetworkStack extends Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const network = new NetworkConstruct(this, "Network", {
      ipAddresses: ec2.IpAddresses.cidr("10.40.0.0/16"),
      maxAzs: 2,
      natGateways: 1,
    });

    console.log(`Start stack create vpc ${network.vpc.vpcId}`);

    this.vpc = network.vpc;
  }
}
