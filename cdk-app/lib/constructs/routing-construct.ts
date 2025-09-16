import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
export class RoutingConstruct extends Construct {
  public readonly publicRt: ec2.CfnRouteTable;
  public readonly privateRt: ec2.CfnRouteTable;
  constructor(
    scope: Construct,
    id: string,
    vpc: ec2.Vpc,
    publicSubnets: ec2.Subnet[],
    privateSubnets: ec2.Subnet[],
    natGw?: ec2.CfnNatGateway
  ) {
    super(scope, id);

    // iGW

    const igw = new ec2.CfnInternetGateway(this, "InternetGateway");
    new ec2.CfnVPCGatewayAttachment(this, "VpcIgwAttachment", {
      vpcId: vpc.vpcId,
      internetGatewayId: igw.ref,
    });

    // public route table
    this.publicRt = new ec2.CfnRouteTable(this, "PublicRouteTable", {
      vpcId: vpc.vpcId,
    });

    new ec2.CfnRoute(this, "PublicDefaultRoute", {
      routeTableId: this.publicRt.ref,
      destinationCidrBlock: "0.0.0.0/0",
      gatewayId: igw.ref,
    });

    // associate public subnet
    publicSubnets.forEach((s, i) => {
      new ec2.CfnSubnetRouteTableAssociation(this, `PublicAssoc${i + 1}`, {
        routeTableId: this.publicRt.ref,
        subnetId: s.subnetId,
      });
    });

    // private route table
    this.privateRt = new ec2.CfnRouteTable(this, "PrivateRouteTable", {
      vpcId: vpc.vpcId,
    });

    if (natGw) {
      new ec2.CfnRoute(this, "PrivateDefaultRoute", {
        routeTableId: this.privateRt.ref,
        destinationCidrBlock: "0.0.0.0/0",
        gatewayId: igw.ref,
      });
    }
    // associate public subnet
    privateSubnets.forEach((s, i) => {
      new ec2.CfnSubnetRouteTableAssociation(this, `PrivateAssoc${i + 1}`, {
        routeTableId: this.privateRt.ref,
        subnetId: s.subnetId,
      });
    });
  }
}
