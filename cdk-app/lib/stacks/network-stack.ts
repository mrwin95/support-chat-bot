import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import {
  NetworkConstruct,
  NetworkConstructProps,
} from "../constructs/network-construct";

export interface NetworkStackProps extends StackProps, NetworkConstructProps {}
export class NetworkStack extends Stack {
  public readonly vpc: ec2.IVpc;
  public readonly network: NetworkConstruct;
  constructor(scope: Construct, id: string, props: NetworkStackProps) {
    super(scope, id, props);

    const network = new NetworkConstruct(this, "Network", {
      cidr: props?.cidr,
      publicSubnetCidrs: props.publicSubnetCidrs,
      privateSubnetCidrs: props.privateSubnetCidrs,
      maxAzs: props.maxAzs,
      natGateways: props.natGateways,
      subnetTags: {
        Environment: "dev",
      },
    });

    console.log(`Start stack create vpc ${network}`);

    this.network = network;
  }
}
