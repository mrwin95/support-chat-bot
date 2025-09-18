import { Construct } from "constructs";
import * as eks from "aws-cdk-lib/aws-eks";
export interface EksAddOnConfig {
  cni?: boolean;
  coredns?: boolean;
  kubeProxy?: boolean;
  ebsCsi?: boolean;
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
    if (config.cni) {
      new eks.CfnAddon(this, "VpcCniAddon", {
        clusterName: cluster.clusterName,
        addonName: "vpc-cni",
        addonVersion: "latest",
        resolveConflicts: "OVERWRITE",
      });
    }

    if (config.coredns) {
      new eks.CfnAddon(this, "CoreDnsAddon", {
        clusterName: cluster.clusterName,
        addonName: "coredns",
        addonVersion: "latest",
        resolveConflicts: "OVERWRITE",
      });
    }

    if (config.kubeProxy) {
      new eks.CfnAddon(this, "KubeProxyAddon", {
        clusterName: cluster.clusterName,
        addonName: "kube-proxy",
        addonVersion: "latest",
        resolveConflicts: "OVERWRITE",
      });
    }

    if (config.ebsCsi) {
      new eks.CfnAddon(this, "EbsCsiAddon", {
        clusterName: cluster.clusterName,
        addonName: "aws-ebs-csi-drive",
        addonVersion: "latest",
        resolveConflicts: "OVERWRITE",
      });
    }

    (config.extras ?? []).forEach((addon) => {
      new eks.CfnAddon(this, `${addon.name}Addon`, {
        clusterName: cluster.clusterName,
        addonName: addon.name,
        addonVersion: addon.version ?? "latest",
        resolveConflicts: "OVERWRITE",
      });
    });
  }
}
