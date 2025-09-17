import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Fn } from "aws-cdk-lib";

export interface SubnetConstructProps {
  vpc: ec2.IVpc;
  cidrs: string[];
  isPublic: boolean;
}
export class SubnetConstruct extends Construct {
  public readonly subnets: ec2.ISubnet[] = [];
  constructor(scope: Construct, id: string, props: SubnetConstructProps) {
    super(scope, id);

    props.cidrs.forEach((cidr, index) => {
      const cfnSubnet = new ec2.CfnSubnet(this, `${id}-Subnet-${index + 1}`, {
        vpcId: props.vpc.vpcId,
        cidrBlock: cidr,
        availabilityZone: Fn.select(index, props.vpc.availabilityZones),
        mapPublicIpOnLaunch: props.isPublic,
      });

      // Create a dedicated route table (unless you want to share later)
      const rt = new ec2.CfnRouteTable(this, `${id}-RouteTable-${index + 1}`, {
        vpcId: props.vpc.vpcId,
      });

      // Associate subnet ↔ route table
      new ec2.CfnSubnetRouteTableAssociation(this, `${id}-Assoc-${index + 1}`, {
        subnetId: cfnSubnet.ref,
        routeTableId: rt.ref,
      });

      // Import as ISubnet with routeTableId so warnings go away
      const subnet = ec2.Subnet.fromSubnetAttributes(
        this,
        `${id}-Imported-${index + 1}`,
        {
          subnetId: cfnSubnet.ref,
          availabilityZone: Fn.select(index, props.vpc.availabilityZones),
          routeTableId: rt.ref,
        }
      );
    });
  }
}
