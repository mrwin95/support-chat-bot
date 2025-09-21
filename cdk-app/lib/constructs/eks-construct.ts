// import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as eks from "aws-cdk-lib/aws-eks";
import * as kubectl33 from "@aws-cdk/lambda-layer-kubectl-v33";
// import * as kubectl32 from "@aws-cdk/lambda-layer-kubectl-v32";
import * as iam from "aws-cdk-lib/aws-iam";
// import { EksSecurityGroupConstruct } from "./eks-security-group-construct";
// import { Fn } from "aws-cdk-lib";

export interface EksConstructProps {
  clusterName: string;
  version: eks.KubernetesVersion;
  desiredCapacity: number;
  instanceType: ec2.InstanceType;
  workerRole: iam.IRole;
  adminRole: iam.IRole;
  vpcSubnets?: ec2.SubnetSelection[];
  workerNodeNameTag?: string;
  eksNodeSg?: ec2.ISecurityGroup;
  ssmPrefix?: string;
}

export class EksConstruct extends Construct {
  public readonly cluster: eks.Cluster;
  //   public readonly eksNodeSg: ec2.ISecurityGroup;
  constructor(
    scope: Construct,
    id: string,
    vpc: ec2.IVpc,
    config: EksConstructProps
  ) {
    super(scope, id);

    // EKS cluster
    this.cluster = new eks.Cluster(this, "EksCluster", {
      vpc,
      clusterName: config.clusterName,
      version: config.version,
      defaultCapacity: 0,
      kubectlLayer: new kubectl33.KubectlV33Layer(this, "KubectlV33Layer"),
      vpcSubnets: config.vpcSubnets,
      securityGroup: config.eksNodeSg,
    });

    // map iam admin role to kubernetes
    this.cluster.awsAuth.addMastersRole(config.adminRole);
    // node group

    // const workerSgId = StringParameter.valueForStringParameter(
    //   this,
    //   `${config.ssmPrefix}EksNodeSgId`
    // );

    // const workerSg = ec2.SecurityGroup.fromSecurityGroupId(
    //   this,
    //   "ImportedEksNodeSG",
    //   workerSgId
    // );

    this.cluster.addNodegroupCapacity("EksWorkers", {
      nodegroupName: `${config.clusterName}-solid-workers`,
      nodeRole: config.workerRole,
      desiredSize: config.desiredCapacity,
      minSize: 1,
      maxSize: 4,
      instanceTypes: [config.instanceType],
      subnets: config.vpcSubnets ? config.vpcSubnets[0] : undefined,
      amiType: eks.NodegroupAmiType.AL2023_X86_64_STANDARD, // 1.33 //BOTTLEROCKET_X86_64 container
      tags: {
        [`kubernetes.io/cluster/${config.clusterName}`]: "owned",
        Name: `${config.clusterName}-worker`,
      },
      remoteAccess: {
        sshKeyName: "worker-key",
        ...(config.eksNodeSg
          ? { sourceSecurityGroups: [config.eksNodeSg] }
          : {}),
      },
    });

    if (config.eksNodeSg) {
      this.cluster.clusterSecurityGroup.addIngressRule(
        config.eksNodeSg,
        ec2.Port.allTraffic(),
        "Allow traffic between EKS cluster and worker nodes"
      );
    }
  }
}
