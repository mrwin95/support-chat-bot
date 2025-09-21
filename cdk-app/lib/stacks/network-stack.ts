import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import {
  NetworkConstruct,
  NetworkConstructProps,
} from "../constructs/network-construct";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export interface NetworkStackProps extends StackProps, NetworkConstructProps {
  ssmPrefix: string;
}
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
      ssmPrefix: props.ssmPrefix,
    });

    new StringParameter(this, "VpcPrivateSubnet01", {
      parameterName: `${props.ssmPrefix}PrivateSubnet1`,
      stringValue: network.privateSubnets[0].subnetId,
    });
    new StringParameter(this, "VpcPrivateSubnet02", {
      parameterName: `${props.ssmPrefix}PrivateSubnet2`,
      stringValue: network.privateSubnets[1].subnetId,
    });

    new StringParameter(this, "VpcId", {
      parameterName: `${props.ssmPrefix}VpcId`,
      stringValue: network.vpc.vpcId,
    });

    console.log(`Start stack create vpc ${network}`);

    this.network = network;
  }
}
