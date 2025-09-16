import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export class NatGatewayConstruct extends Construct {
  public readonly natGw: ec2.CfnNatGateway;
  constructor(scope: Construct, id: string, publicSubnet: ec2.Subnet) {
    super(scope, id);

    const eip = new ec2.CfnEIP(this, "NatEIP");
    this.natGw = new ec2.CfnNatGateway(this, "NatGateway", {
      subnetId: publicSubnet.subnetId,
      allocationId: eip.attrAllocationId,
    });
  }
}
