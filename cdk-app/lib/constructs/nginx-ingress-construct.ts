import { Stack } from "aws-cdk-lib";
import { Cluster } from "aws-cdk-lib/aws-eks";
import { Construct } from "constructs";

export interface NginxIngressProps {
  cluster: Cluster;
}

export class NginxIngressConstruct extends Construct {
  constructor(scope: Construct, id: string, props: NginxIngressProps) {
    super(scope, id);

    const { cluster } = props;

    // 1. Install AWS Load Balancer Controller (ALB ingress)
    cluster.addHelmChart("AlbController", {
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
