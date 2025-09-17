import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { INetworkConfig } from "../interfaces/INetworkConfig";
import { Tags } from "aws-cdk-lib";

export class NetworkConstruct extends Construct {
  public readonly vpc: ec2.Vpc;
  public readonly publicSubnets: ec2.ISubnet[] = [];
  public readonly privateSubnets: ec2.ISubnet[] = [];

  constructor(scope: Construct, id: string, config: INetworkConfig) {
    super(scope, id);

    // Base VPC
    this.vpc = new ec2.Vpc(this, "Vpc", {
      vpcName: "solid-vpc",
      ipAddresses: ec2.IpAddresses.cidr(config.cidr),
      maxAzs: config.maxAzs,
      subnetConfiguration: [],
      natGateways: 0, // we handle NAT manually
    });

    // apply tag
    if (config.tags) {
      for (const [k, v] of Object.entries(config.tags)) {
        Tags.of(this.vpc).add(k, v);
      }
    }

    // Internet Gateway
    const igw = new ec2.CfnInternetGateway(this, "InternetGateway", {
      tags: [
        {
          key: "Name",
          value: `internet-gateway-${this.vpc.vpcId}`,
        },
        { key: "Environment", value: "dev" },
      ],
    });

    new ec2.CfnVPCGatewayAttachment(this, "IGWAttachment", {
      vpcId: this.vpc.vpcId,
      internetGatewayId: igw.ref,
    });

    // Public Subnets
    const publicSubnetsRaw: ec2.CfnSubnet[] = [];
    const publicRT = new ec2.CfnRouteTable(this, "PublicRouteTable", {
      vpcId: this.vpc.vpcId,
      tags: [
        { key: "Name", value: "public-route-table" },
        { key: "Environment", value: "dev" },
      ],
    });

    config.publicSubnetCidrs.forEach((cidr, index) => {
      const subnet = new ec2.CfnSubnet(this, `PublicSubnet${index + 1}`, {
        vpcId: this.vpc.vpcId,
        availabilityZone: this.vpc.availabilityZones[index],
        cidrBlock: cidr,
        mapPublicIpOnLaunch: true,
        tags: [
          { key: "Name", value: `public-subnet-${index + 1}` },
          { key: "Environment", value: "dev" },
          { key: "Type", value: "public" },
          ...(config.tags
            ? Object.entries(config.tags).map(([k, v]) => ({ key: k, value: v }))
            : []),
        ],
      });
      publicSubnetsRaw.push(subnet);
      // Public Route Table

      // wrap as subnet for selections

      this.publicSubnets.push(
        ec2.Subnet.fromSubnetAttributes(this, `PubSubnetRef${index + 1}`, {
          subnetId: subnet.ref,
          availabilityZone: this.vpc.availabilityZones[index],
          routeTableId: publicRT.ref,
        })
      );
    });

    new ec2.CfnRoute(this, "DefaultPublicRoute", {
      routeTableId: publicRT.ref,
      destinationCidrBlock: "0.0.0.0/0",
      gatewayId: igw.ref,
    });

    publicSubnetsRaw.forEach((subnet, i) => {
      new ec2.CfnSubnetRouteTableAssociation(this, `PublicSubnetAssoc${i + 1}`, {
        routeTableId: publicRT.ref,
        subnetId: subnet.ref,
      });
    });

    // NAT Gateways (limit by natGateways param)
    const natGateways: ec2.CfnNatGateway[] = [];
    for (let i = 0; i < config.natGateways && i < publicSubnetsRaw.length; i++) {
      const eip = new ec2.CfnEIP(this, `NatEip${i + 1}`, {
        domain: "vpc",
        tags: [
          {
            key: "Name",
            value: `NatEip${i + 1}`,
          },
          { key: "Environment", value: "dev" },
        ],
      });
      const natGw = new ec2.CfnNatGateway(this, `NatGateway${i + 1}`, {
        subnetId: publicSubnetsRaw[i].ref,
        allocationId: eip.attrAllocationId,
        tags: [
          { key: "Name", value: `nat-gateway-${i + 1}` },
          { key: "Environment", value: "dev" },
        ],
      });
      natGateways.push(natGw);
    }

    // Private Subnets + RouteTables
    config.privateSubnetCidrs.forEach((cidr, index) => {
      const subnet = new ec2.CfnSubnet(this, `PrivateSubnet${index + 1}`, {
        vpcId: this.vpc.vpcId,
        availabilityZone: this.vpc.availabilityZones[index],
        cidrBlock: cidr,
        mapPublicIpOnLaunch: false,
        tags: [
          { key: "Name", value: `private-subnet-${index + 1}` },
          { key: "Environment", value: "dev" },
          { key: "Type", value: "private" },
          ...(config.tags
            ? Object.entries(config.tags).map(([k, v]) => ({ key: k, value: v }))
            : []),
        ],
      });

      const rt = new ec2.CfnRouteTable(this, `PrivateRouteTable${index + 1}`, {
        vpcId: this.vpc.vpcId,
        tags: [
          { key: "Name", value: `private-route-table-${index + 1}` },
          { key: "Environment", value: "dev" },
        ],
      });

      this.privateSubnets.push(
        ec2.Subnet.fromSubnetAttributes(this, `PrivSubnetRef${index + 1}`, {
          subnetId: subnet.ref,
          availabilityZone: this.vpc.availabilityZones[index],
          routeTableId: rt.ref,
        })
      );

      // Choose NAT Gateway (map private subnet AZ → NAT in same AZ if exists)
      const natIndex = index < natGateways.length ? index : 0; // fallback to first NAT
      if (natGateways.length > 0) {
        new ec2.CfnRoute(this, `PrivateRoute${index + 1}`, {
          routeTableId: rt.ref,
          destinationCidrBlock: "0.0.0.0/0",
          natGatewayId: natGateways[natIndex].ref,
        });
      }
      new ec2.CfnSubnetRouteTableAssociation(
        this,
        `PrivateSubnetAssoc${index + 1}`,
        {
          routeTableId: rt.ref,
          subnetId: subnet.ref,
        }
      );
    });
  }

  // subnet selection for downstream
  public subnetSelections() {
    return {
      public: { subnets: this.publicSubnets },
      private: { subnets: this.privateSubnets },
    };
  }
}
