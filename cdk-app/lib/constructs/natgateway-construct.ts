import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export interface NatGatewayProps {
  vpc: ec2.IVpc;
  publicSubnets: ec2.ISubnet[];
}
export class NatGatewayConstruct extends Construct {
  public readonly natGateways: ec2.CfnNatGateway[] = [];
  constructor(scope: Construct, id: string, props: NatGatewayProps) {
    super(scope, id);

    props.publicSubnets.forEach((subnet, i) => {
      const eip = new ec2.CfnEIP(this, `NatEip-${i + 1}`);
      const natGw = new ec2.CfnNatGateway(this, `NatGw-${i + 1}`, {
        subnetId: subnet.subnetId,
        allocationId: eip.attrAllocationId,
      });

      this.natGateways.push(natGw);
    });
  }
}
