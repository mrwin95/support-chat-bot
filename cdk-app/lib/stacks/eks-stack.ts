import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { EksConstruct } from "../constructs/eks-construct";
import * as eks from "aws-cdk-lib/aws-eks";
import { IVpc } from "aws-cdk-lib/aws-ec2";
import { IamConstruct } from "../constructs/iam-construct";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { NetworkConstruct } from "../constructs/network-construct";

export interface EksStackProps extends StackProps {
    
}

export class EksStack extends Stack {
    network: NetworkConstruct;
  constructor(
    scope: Construct,
    id: string,
    network: NetworkConstruct,
    props: EksStackProps
  ) {
    super(scope, id, props);
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
