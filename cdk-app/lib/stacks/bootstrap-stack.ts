import { App } from "aws-cdk-lib";
import { NetworkStack } from "./network-stack";
import { IamStack } from "./iam-stack";
import { EksStack } from "./eks-stack";
import * as eks from "aws-cdk-lib/aws-eks";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { EksAddOnStack } from "./addons-stack";
import * as iam from "aws-cdk-lib/aws-iam";
export function bootstrap(app: App, envProps: {}) {
  const ssmPrefix = "/solid/dev/roles/";
  const iamStack = new IamStack(app, "IamStack", {
    env: envProps,
    adminRoleName: "EksAdminRole",
    workerRoleName: "EksWorkerRole",
    ssmPrefix,
    importOnly: false,
    podIdentityRoles: [
      { roleName: "S3ReaderRole" },
      { roleName: "DynamoWriterRole" },
    ],
  });

  const networkStack = new NetworkStack(app, "NetworkStack", {
    env: envProps,
    cidr: "10.40.0.0/16",
    publicSubnetCidrs: ["10.40.128.0/20", "10.40.144.0/20"],
    privateSubnetCidrs: ["10.40.32.0/19", "10.40.64.0/19"],
    maxAzs: 2,
    natGateways: 1,
    subnetTags: {
      Environment: "dev",
    },
  });

  const eksStack = new EksStack(app, "EksStack", {
    env: envProps,
    network: networkStack.network,
    eksConfig: {
      clusterName: "solid-eks",
      version: eks.KubernetesVersion.V1_33,
      desiredCapacity: 1,
      instanceType: new ec2.InstanceType("t3.small"),
    },
    ssmPrefix,
  });

  const addOnStack = new EksAddOnStack(app, "EksAddOnStack", {
    env: envProps,
    cluster: eksStack.cluster,
    addOnConfig: {
      cni: true,
      coredns: true,
      kubeProxy: true,
      podIdentityAgent: true,
      podIdentityAssociations: [
        {
          role: iamStack.iam.podIdentityRoles["S3ReaderRole"], // iam.IRole
          namespace: "data-team",
          serviceAccount: "s3-reader",
          createServiceAccount: true,
        },
        {
          role: iamStack.iam.podIdentityRoles["DynamoWriterRole"], // iam.IRole
          namespace: "backend",
          serviceAccount: "dynamo-writer",
          createServiceAccount: true,
        },
      ],
      ebsCsi: {
        enable: true,
      },
    },
  });
  eksStack.addDependency(iamStack);
  eksStack.addDependency(networkStack);
  addOnStack.addDependency(eksStack);
}
