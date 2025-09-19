import { Construct } from "constructs";
import * as eks from "aws-cdk-lib/aws-eks";
import { getAddonVersions } from "../utils/eks-addon-versions";
export interface EksAddOnConfig {
  cni?: boolean;
  coredns?: boolean;
  kubeProxy?: boolean;
  ebsCsi?: { enable: boolean; serviceAccountRoleArn?: string };
  extras?: { name: string; version?: string }[];
}

export class EksAddOnConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    cluster: eks.Cluster,
    config: EksAddOnConfig
  ) {
    super(scope, id);

    // const versions = getAddonVersions(eks.KubernetesVersion.V1_32);

    if (config.cni) {
      new eks.CfnAddon(this, "AddonVpcCni", {
        clusterName: cluster.clusterName,
        addonName: "vpc-cni",
        resolveConflicts: "OVERWRITE",
      });
    }

    if (config.coredns) {
      new eks.CfnAddon(this, "AddonCoreDns", {
        clusterName: cluster.clusterName,
        addonName: "coredns",
        resolveConflicts: "OVERWRITE",
      });
    }

    if (config.kubeProxy) {
      new eks.CfnAddon(this, "AddonKubeProxy", {
        clusterName: cluster.clusterName,
        addonName: "kube-proxy",
        resolveConflicts: "OVERWRITE",
      });
    }

    if (config.ebsCsi?.enable) {
      new eks.CfnAddon(this, "AddonEbsCsi", {
        clusterName: cluster.clusterName,
        addonName: "aws-ebs-csi-driver",
        serviceAccountRoleArn: config.ebsCsi.serviceAccountRoleArn,
        resolveConflicts: "OVERWRITE",
      });
    }

    (config.extras ?? []).forEach((addon) => {
      new eks.CfnAddon(this, `${addon.name}Addon`, {
        clusterName: cluster.clusterName,
        addonName: addon.name,
        addonVersion: addon.version ?? "",
        resolveConflicts: "OVERWRITE",
      });
    });
  }
}
