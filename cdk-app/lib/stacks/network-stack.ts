import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { NetworkConstruct } from "../constructs/network-construct";
import { IamConstruct } from "../constructs/iam-construct";
import { EksConstruct } from "../constructs/eks-construct";
import * as eks from "aws-cdk-lib/aws-eks";

export class NetworkStack extends Stack {
  public readonly vpc: ec2.IVpc;
  public readonly network: NetworkConstruct;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const network = new NetworkConstruct(this, "Network", {
      cidr: "10.40.0.0/16",
      publicSubnetCidrs: ["10.40.128.0/20", "10.40.144.0/20"],
      privateSubnetCidrs: ["10.40.32.0/19", "10.40.64.0/19"],
      maxAzs: 2,
      natGateways: 1,
      tags: {
        Environment: "dev",
      },
    });

    console.log(`Start stack create vpc ${network}`);

    this.network = network;
    // IAM Roles
    const iamConstruct = new IamConstruct(this, "iam", {
      roleName: "eks-admin-role",
      userArns: ["arn:aws:iam::442042528400:role/DevInfraRole"],
    });

    // EKS Cluster + Workers
    const eksConstruct = new EksConstruct(this, "Eks", network.vpc, {
      clusterName: "solid-eks",
      version: eks.KubernetesVersion.V1_33,

      desiredCapacity: 2,
      instanceType: new ec2.InstanceType("t3.small"),
      workerRole: iamConstruct.workerAdminRole,
      adminRole: iamConstruct.eksAdminRole,
      vpcSubnets: [network.subnetSelections().private],
    });
  }
}
