import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { EksConstruct } from "../constructs/eks-construct";
import * as eks from "aws-cdk-lib/aws-eks";
import { IVpc } from "aws-cdk-lib/aws-ec2";
import { IamConstruct } from "../constructs/iam-construct";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export interface EksStackProps extends StackProps {
  vpc: IVpc;
}

export class EksStack extends Stack {
  constructor(scope: Construct, id: string, props: EksStackProps) {
    super(scope, id);

    // IAM Roles
    const iamConstruct = new IamConstruct(this, "iam", {
      roleName: "eks-admin-role",
      userArns: ["arn:aws:iam::442042528400:role/DevInfraRole"],
    });

    // EKS Cluster + Workers
    const eksConstruct = new EksConstruct(this, "Eks", props.vpc, {
      clusterName: "solid-eks",
      version: eks.KubernetesVersion.V1_33,

      desiredCapacity: 2,
      instanceType: new ec2.InstanceType("t2.small"),
      workerRole: iamConstruct.workerAdminRole,
      adminRole: iamConstruct.eksAdminRole,
      vpcSubnets: [],
    });
  }
}
