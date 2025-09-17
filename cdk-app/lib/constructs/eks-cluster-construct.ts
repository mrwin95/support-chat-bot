import { Construct } from "constructs";
import { IEksConfig } from "../interfaces/IEksConfig";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as eks from "aws-cdk-lib/aws-eks";
import * as kubectl from "@aws-cdk/lambda-layer-kubectl-v33";

export class EksClusterConstruct extends Construct {
  public readonly cluster: eks.Cluster;
  constructor(scope: Construct, id: string, vpc: ec2.IVpc, config: IEksConfig) {
    super(scope, id);

    // EKS IAM role

    const clusterRole = new iam.Role(this, "EksClusterRole", {
      assumedBy: new iam.ServicePrincipal("eks.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKSClusterPolicy"),
      ],
    });

    // create eks control plane

    this.cluster = new eks.Cluster(this, "EksCluster", {
      clusterName: config.clusterName,
      version: eks.KubernetesVersion.of(config.version),
      vpc: vpc,
      defaultCapacity: 0,
      role: clusterRole,
      kubectlLayer: new kubectl.KubectlV33Layer(this, "KubectlLayer"),
    });
  }
}
