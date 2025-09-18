import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { EksConstruct, EksConstructProps } from "../constructs/eks-construct";
import * as eks from "aws-cdk-lib/aws-eks";
import { IVpc } from "aws-cdk-lib/aws-ec2";
import { IamConstruct } from "../constructs/iam-construct";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { NetworkConstruct } from "../constructs/network-construct";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as iam from "aws-cdk-lib/aws-iam";
export interface EksStackProps extends StackProps {
  network: NetworkConstruct;
  //   iam: IamConstruct;
  eksConfig: Omit<EksConstructProps, "adminRole" | "workerRole" | "vpc">;
  ssmPrefix: string;
}

export class EksStack extends Stack {
  //   network: NetworkConstruct;
  constructor(
    scope: Construct,
    id: string,
    // network: NetworkConstruct,
    props: EksStackProps
  ) {
    super(scope, id, props);
    // this.network = network;
    // IAM Roles
    const { network, eksConfig, ssmPrefix } = props;

    const adminArn = ssm.StringParameter.fromStringParameterName(
      this,
      "EksAdminRoleParam",
      `${ssmPrefix}EksAdminRoleArn`
    );
    const workerArn = ssm.StringParameter.fromStringParameterName(
      this,
      "EksWorkerRoleParam",
      `${ssmPrefix}EksWorkerRoleArn`
    );
    const adminRole = iam.Role.fromRoleArn(
      this,
      "ImportedAdminRole",
      adminArn.stringValue,
      {
        mutable: false,
      }
    );
    const workerRole = iam.Role.fromRoleArn(
      this,
      "ImportedWorkerRole",
      workerArn.stringValue,
      { mutable: false }
    );

    // const iamConstruct =
    // new IamConstruct(this, "iam", {
    //   roleName: "eks-admin-role",
    //   userArns: ["arn:aws:iam::442042528400:role/DevInfraRole"],
    // });

    // EKS Cluster + Workers
    new EksConstruct(this, "Eks", network.vpc, {
      ...eksConfig,
      clusterName: "solid-eks",
      version: eks.KubernetesVersion.V1_33,

      //   desiredCapacity: 2,
      //   instanceType: new ec2.InstanceType("t3.small"),
      //   admin: iam.adminRole,
      adminRole: adminRole,
      workerRole: workerRole,
      vpcSubnets: [network.subnetSelections().private],
    });
  }
}
