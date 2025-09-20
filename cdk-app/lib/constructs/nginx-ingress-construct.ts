import { CfnJson, Fn, RemovalPolicy, Stack } from "aws-cdk-lib";
import { Cluster } from "aws-cdk-lib/aws-eks";
import * as eks from "aws-cdk-lib/aws-eks";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { AlbIamControllerConstruct } from "./alb-iam-controller-construct";
export interface NginxIngressProps {
  cluster: Cluster;
  ssmPrefix?: string;
}

export class NginxIngressConstruct extends Construct {
  public readonly albRole: iam.IRole;
  private readonly saName = "aws-load-balancer-controller";
  private readonly saNs = "kube-system";

  constructor(scope: Construct, id: string, props: NginxIngressProps) {
    super(scope, id);

    const { cluster, ssmPrefix } = props;

    // Read OIDC info from SSM (exported by EksStack)

    // 1. Install AWS Load Balancer Controller (ALB ingress)
    const albController = cluster.addHelmChart("AlbController", {
      chart: "aws-load-balancer-controller",
      repository: "https://aws.github.io/eks-charts",
      release: "aws-load-balancer-controller",
      namespace: "kube-system",
      version: "1.9.2", // pick one that matches your cluster version
      values: {
        clusterName: cluster.clusterName,
        region: Stack.of(this).region,
        vpcId: cluster.vpc.vpcId,
        serviceAccount: {
          create: false,
          name: "aws-load-balancer-controller",
        },
      },
    });
    // Ensure SA exists before Helm mutating webhooks run
    // albController.node.addDependency(saManifest);

    // albController.node.addDependency(albSA);

    // 2. Install NGINX Ingress
    cluster.addHelmChart("NginxIngress", {
      chart: "ingress-nginx",
      repository: "https://kubernetes.github.io/ingress-nginx",
      release: "nginx-ingress",
      namespace: "ingress-nginx",
      version: "4.11.0",
      values: {
        controller: {
          admissionWebhooks: { enabled: false }, // avoid webhook clash w/ ALB
          service: { type: "NodePort" },
          minReadySeconds: 5,
          progressDeadlineSeconds: 600,
        },
      },
    });
  }
}
