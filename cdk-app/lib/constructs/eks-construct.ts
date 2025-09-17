import { Construct } from "constructs";
import { IEksConfig } from "../interfaces/IEksConfig";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { EksClusterConstruct } from "./eks-cluster-construct";
import { EksNodeGroupConstruct } from "./eks-nodegroup-construct";
import * as eks from "aws-cdk-lib/aws-eks";
import * as kubectl from "@aws-cdk/lambda-layer-kubectl-v33";
import * as iam from "aws-cdk-lib/aws-iam";

export interface EksConfig {
  clusterName: string;
  version: eks.KubernetesVersion;
  desiredCapacity: number;
  instanceType: ec2.InstanceType;
  workerRole: iam.Role;
  adminRole: iam.Role;
  vpcSubnets: ec2.SubnetSelection[];
}

export class EksConstruct extends Construct {
  public readonly cluster: eks.Cluster;
  constructor(scope: Construct, id: string, vpc: ec2.IVpc, config: EksConfig) {
    super(scope, id);

    // EKS cluster
    this.cluster = new eks.Cluster(this, "EksCluster", {
      vpc,
      clusterName: config.clusterName,
      version: config.version,
      defaultCapacity: 0,
      kubectlLayer: new kubectl.KubectlV33Layer(this, "KubectlV33Layer"),
      vpcSubnets: config.vpcSubnets,
    });

    // map iam admin role to kubernetes
    this.cluster.awsAuth.addMastersRole(config.adminRole);
    // node group

    this.cluster.addNodegroupCapacity("EksWorkers", {
      nodeRole: config.workerRole,
      desiredSize: config.desiredCapacity,
      minSize: 1,
      maxSize: 4,
      instanceTypes: [config.instanceType],
      subnets: config.vpcSubnets[0],
      amiType: eks.NodegroupAmiType.AL2023_X86_64_STANDARD, // 1.33 //BOTTLEROCKET_X86_64 container
    });
  }
}
