import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Fn } from "aws-cdk-lib";

export class SubnetConstruct extends Construct {
  public readonly subnets: ec2.Subnet[] = [];
  constructor(
    scope: Construct,
    id: string,
    vpc: ec2.Vpc,
    cidrs: string[],
    isPublic: boolean
  ) {
    super(scope, id);

    cidrs.forEach((cidr, index) => {
      const subnet = new ec2.Subnet(this, `${id}-Subnet-${index + 1}`, {
        vpcId: vpc.vpcId,
        cidrBlock: cidr,
        availabilityZone: Fn.select(index, vpc.availabilityZones),
        mapPublicIpOnLaunch: isPublic,
      });

      this.subnets.push(subnet);
    });
  }
}
