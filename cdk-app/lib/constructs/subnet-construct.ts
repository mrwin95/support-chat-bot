import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export class SubnetConstruct extends Construct {
  public readonly vpc: ec2.Vpc;
  constructor(scope: Construct, id: string, cidr: string) {
    super(scope, id);

    this.vpc = new ec2.Vpc(this, "VPC", {
      ipAddresses: ec2.IpAddresses.cidr(cidr),
      maxAzs: 2,
      natGateways: 1,
    });
    // const network = new NetworkConstruct(this, "Network", {
    //   ipAddresses: ec2.IpAddresses.cidr("10.40.0.0/16"),
    //   maxAzs: 2,
    //   natGateways: 1,
    // });

    // this.vpc = new ec2.Vpc(this, "Vpc", {
    //   //   cidr,
    // });
  }
}
