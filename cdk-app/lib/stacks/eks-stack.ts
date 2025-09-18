import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { EksConstruct, EksConstructProps } from "../constructs/eks-construct";
import * as eks from "aws-cdk-lib/aws-eks";
import { NetworkConstruct } from "../constructs/network-construct";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as iam from "aws-cdk-lib/aws-iam";
export interface EksStackProps extends StackProps {
  network: NetworkConstruct;
  eksConfig: Omit<EksConstructProps, "adminRole" | "workerRole" | "vpc">;
  ssmPrefix: string;
}

export class EksStack extends Stack {
  constructor(scope: Construct, id: string, props: EksStackProps) {
    super(scope, id, props);
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
    // EKS Cluster + Workers
    new EksConstruct(this, "Eks", network.vpc, {
      ...eksConfig,
      clusterName: "solid-eks",
      version: eks.KubernetesVersion.V1_33,
      adminRole: adminRole,
      workerRole: workerRole,
      vpcSubnets: [network.subnetSelections().private],
    });
  }
}
