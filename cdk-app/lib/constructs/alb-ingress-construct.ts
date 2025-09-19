import { Stack } from "aws-cdk-lib";
import * as eks from "aws-cdk-lib/aws-eks";
import { Construct } from "constructs";
export interface AlbIngressProps {
  cluster: eks.Cluster;
}

export class AlbIngressConstruct extends Construct {
  constructor(scope: Construct, id: string, props: AlbIngressProps) {
    super(scope, id);

    const { cluster } = props;

    const albController = cluster.addHelmChart("AwsLoadBalancerController", {
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

    // wait for it
    albController.node.addDependency(cluster.openIdConnectProvider);

    // NGINX Ingress
    const nginxIngress = cluster.addHelmChart("NginxIngress", {
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

    nginxIngress.node.addDependency(albController);
  }
}
