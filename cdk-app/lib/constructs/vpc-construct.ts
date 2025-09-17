import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export class VpcConstruct extends Construct {
  public readonly vpc: ec2.IVpc;

  constructor(scope: Construct, id: string, cidr: string, maxAzs: number) {
    super(scope, id);

    // const cfnVpc = new ec2.CfnVPC(this, "CfnVpc", {
    //   cidrBlock: cidr,
    //   enableDnsHostnames: true,
    //   enableDnsSupport: true,
    // });

    // this.vpc = ec2.Vpc.fromVpcAttributes(this, "ImportedVpc", {
    //   vpcId: cfnVpc.ref,
    //   availabilityZones: scope.node.tryGetContext("availabilityZones") ?? [
    //     "ap-south-1a",
    //     "ap-south-1b",
    //   ],
    // });

    this.vpc = new ec2.Vpc(this, "Vpc", {
      ipAddresses: ec2.IpAddresses.cidr(cidr),
      maxAzs: maxAzs,
      subnetConfiguration: [],
      natGateways: 0,
    });
  }
}
