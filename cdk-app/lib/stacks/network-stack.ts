import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { NetworkConstruct } from "../constructs/network-construct";
export class NetworkStack extends Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const network = new NetworkConstruct(this, "Network", {
      cidr: "10.40.0.0/16",
      maxAzs: 2,
      natGateways: 1,
      publicCidrs: ["10.40.128.0/20", "10.40.144.0/20"],
      privateCidrs: ["10.40.32.0/19", "10.40.64.0/19"],
    });

    console.log(`Start stack create vpc ${network}`);
  }
}
