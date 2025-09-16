import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as cdk from "aws-cdk-lib";

export class PrivateSubnetConstruct extends Construct {
  public readonly subnets: ec2.Subnet[] = [];
  constructor(scope: Construct, id: string, vpc: ec2.Vpc, cidrs: string[]) {
    super(scope, id);

    cidrs.forEach((cidr, index) => {
      const subnet = new ec2.Subnet(this, `PrivateSubnet${index + 1}`, {
        vpcId: vpc.vpcId,
        cidrBlock: cidr,
        availabilityZone: cdk.Fn.select(index, vpc.availabilityZones),
        mapPublicIpOnLaunch: false,
      });

      this.subnets.push(subnet);
    });
  }
}
