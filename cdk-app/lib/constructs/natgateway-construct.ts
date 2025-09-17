import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export interface NatGatewayProps {
  vpc: ec2.IVpc;
  publicSubnets: ec2.ISubnet[];
}

// export class NatGatewayConstruct extends Construct {
//   public readonly natGateways: ec2.CfnNatGateway[] = [];

//   constructor(scope: Construct, id: string, props: NatGatewayProps) {
//     super(scope, id);

//     for (let i = 0; i < props.natGateways; i++) {
//       const pubSubnet = props.publicSubnets[i % props.publicSubnets.length];
//       const eip = new ec2.CfnEIP(this, `NatEip-${i + 1}`);
//       const natGw = new ec2.CfnNatGateway(this, `NatGw-${i + 1}`, {
//         subnetId: pubSubnet.subnetId,
//         allocationId: eip.attrAllocationId,
//       });

//       this.natGateways.push(natGw);
//     }
//   }
// }

// export interface NatGatewayProps {
//   vpc: ec2.IVpc;
//   publicSubnets: ec2.ISubnet[];
//   privateSubnets: ec2.ISubnet[];
//   natGateways: number; // how many NATs to create
// }

// export class NatGatewayConstruct extends Construct {
//   public readonly natGateways: ec2.CfnNatGateway[] = [];

//   constructor(scope: Construct, id: string, props: NatGatewayProps) {
//     super(scope, id);

//     // one route table per private subnet
//     props.privateSubnets.forEach((subnet, i) => {
//       const rt = new ec2.CfnRouteTable(this, `PrivateRt-${i + 1}`, {
//         vpcId: props.vpc.vpcId,
//       });

//       if (props.natGateways > 0) {
//         // distribute NATs across public subnets
//         const pubSubnet = props.publicSubnets[i % props.publicSubnets.length];

//         const eip = new ec2.CfnEIP(this, `NatEip-${i + 1}`, {});
//         const nat = new ec2.CfnNatGateway(this, `NatGw-${i + 1}`, {
//           subnetId: pubSubnet.subnetId,
//           allocationId: eip.attrAllocationId,
//         });

//         this.natGateways.push(nat);

//         new ec2.CfnRoute(this, `PrivateDefaultRoute-${i + 1}`, {
//           routeTableId: rt.ref,
//           destinationCidrBlock: "0.0.0.0/0",
//           natGatewayId: nat.ref,
//         });
//       }

//       new ec2.CfnSubnetRouteTableAssociation(this, `PrivateAssoc-${i + 1}`, {
//         routeTableId: rt.ref,
//         subnetId: subnet.subnetId,
//       });
//     });
//   }
// }

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
