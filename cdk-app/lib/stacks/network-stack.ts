import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import {
  NetworkConstruct,
  NetworkConstructProps,
} from "../constructs/network-construct";

export interface NetworkStackProps extends StackProps, NetworkConstructProps {}
export class NetworkStack extends Stack {
  public readonly vpc: ec2.IVpc;
  public readonly network: NetworkConstruct;
  constructor(scope: Construct, id: string, props: NetworkStackProps) {
    super(scope, id, props);

    const network = new NetworkConstruct(this, "Network", {
      cidr: props?.cidr,
      publicSubnetCidrs: props.publicSubnetCidrs,
      privateSubnetCidrs: props.privateSubnetCidrs,
      maxAzs: props.maxAzs,
      natGateways: props.natGateways,
      subnetTags: {
        Environment: "dev",
      },
    });

    console.log(`Start stack create vpc ${network}`);

    this.network = network;
    // IAM Roles
    // const iamConstruct = new IamConstruct(this, "iam", {
    //   roleName: "eks-admin-role",
    //   userArns: ["arn:aws:iam::442042528400:role/DevInfraRole"],
    // });

    // EKS Cluster + Workers
    // const eksConstruct = new EksConstruct(this, "Eks", network.vpc, {
    //   clusterName: "solid-eks",
    //   version: eks.KubernetesVersion.V1_33,

    //   desiredCapacity: 2,
    //   instanceType: new ec2.InstanceType("t3.small"),
    //   workerRole: iamConstruct.workerAdminRole,
    //   adminRole: iamConstruct.eksAdminRole,
    //   vpcSubnets: [network.subnetSelections().private],
    // });
  }
}
