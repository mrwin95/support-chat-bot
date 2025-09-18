import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
export interface RoutingConstructProps {
  vpc: ec2.IVpc;
  publicSubnets: ec2.ISubnet[];
  privateSubnets: ec2.ISubnet[];
  natGateways: ec2.CfnNatGateway[];
}
export class RoutingConstruct extends Construct {
  public readonly publicRt: ec2.CfnRouteTable;
  public readonly privateRt: ec2.CfnRouteTable;
  constructor(scope: Construct, id: string, props: RoutingConstructProps) {
    super(scope, id);

    // iGW

    const igw = new ec2.CfnInternetGateway(this, "InternetGateway");
    new ec2.CfnVPCGatewayAttachment(this, "VpcIgwAttachment", {
      vpcId: props.vpc.vpcId,
      internetGatewayId: igw.ref,
    });

    // public route table (share)
    const publicRt = new ec2.CfnRouteTable(this, "PublicRouteTable", {
      vpcId: props.vpc.vpcId,
    });

    new ec2.CfnRoute(this, "PublicDefaultRoute", {
      routeTableId: publicRt.ref,
      destinationCidrBlock: "0.0.0.0/0",
      gatewayId: igw.ref,
    });
    props.publicSubnets.forEach((subnet, i) => {
      new ec2.CfnSubnetRouteTableAssociation(this, `PublicAssoc${i + 1}`, {
        subnetId: subnet.subnetId,
        routeTableId: publicRt.ref,
      });
    });

    // private route table
    // Private RT per AZ → NAT in same index
    props.privateSubnets.forEach((subnet, i) => {
      const rt = new ec2.CfnRouteTable(this, `PrivateRouteTable-${i + 1}`, {
        vpcId: props.vpc.vpcId,
      });
      new ec2.CfnRoute(this, `PrivateDefaultRoute-${i + 1}`, {
        routeTableId: rt.ref,
        destinationCidrBlock: "0.0.0.0/0",
        natGatewayId: props.natGateways[i % props.natGateways.length].ref,
      });
      new ec2.CfnSubnetRouteTableAssociation(this, `PrivateAssoc-${i + 1}`, {
        subnetId: subnet.subnetId,
        routeTableId: rt.ref,
      });
    });
  }
}
