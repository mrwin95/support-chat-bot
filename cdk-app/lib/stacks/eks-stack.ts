import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { EksConstruct, EksConstructProps } from "../constructs/eks-construct";
import * as ec2 from "aws-cdk-lib/aws-ec2";
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
  public readonly cluster: eks.Cluster;
  public readonly clusterName: string;

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

    const sgId = ssm.StringParameter.valueForStringParameter(
      this,
      //   `${props.ssmPrefix}EksAdditionalSGId`
      `/solid/dev/vpc/EksAdditionalSGId`
    );
    const eksSg = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      "ImportedEksSG",
      sgId
    );

    // EKS Cluster + Workers
    const { cluster } = new EksConstruct(this, "Eks", network.vpc, {
      ...eksConfig,
      clusterName: this.clusterName,
      version: eks.KubernetesVersion.V1_33,
      adminRole: adminRole,
      workerRole: workerRole,
      vpcSubnets: [network.subnetSelections().private],
      eksNodeSg: eksSg,
    });

    // const oidcProvider = this.cluster.ad
    // if (!this.cluster.openIdConnectProvider) {
    //   throw new Error("OIDC provider is not enabled on this cluster");
    // }

    // After cluster is created in EksStack:
    new ssm.StringParameter(this, "EksOidcProviderArnParam", {
      parameterName: `${ssmPrefix}OidcProviderArn`,
      stringValue: cluster.openIdConnectProvider.openIdConnectProviderArn,
    });

    new ssm.StringParameter(this, "EksOidcProviderIssuerParam", {
      parameterName: `${ssmPrefix}OidcProviderIssuer`,
      stringValue: cluster.openIdConnectProvider.openIdConnectProviderIssuer,
    });

    // new NginxIngressConstruct(this, "IngressConstruct", {
    //   ssmPrefix: "/solid/dev/roles/",
    //   cluster: cluster,
    // });

    // start Alb
    // new AlbIngressConstruct(this, "AlbIngress", { cluster });
    this.cluster = cluster;
  }
}
