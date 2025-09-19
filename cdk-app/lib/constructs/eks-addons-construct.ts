import { Construct } from "constructs";
import * as eks from "aws-cdk-lib/aws-eks";
import * as iam from "aws-cdk-lib/aws-iam";
export interface EksAddOnConfig {
  cni?: boolean;
  coredns?: boolean;
  kubeProxy?: boolean;
  ebsCsi?: { enable: boolean; serviceAccountRoleArn?: string };
  podIdentityAgent?: boolean;
  podIdentityAssociations?: {
    role: string | iam.IRole;
    namespace: string;
    serviceAccount: string;
    createServiceAccount?: boolean;
  }[];

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

    if (config.podIdentityAgent) {
      new eks.CfnAddon(this, "PodIdentityAgentAddon", {
        clusterName: cluster.clusterName,
        addonName: "eks-pod-identity-agent",
        resolveConflicts: "OVERWRITE",
      });
    }

    // --- Pod Identity Associations ---
    // (config.podIdentityAssociations ?? []).forEach((assoc, i) => {
    //   const roleArn =
    //     typeof assoc.role === "string" ? assoc.role : assoc.role.roleArn;

    //   // optional: create SA first
    //   if (assoc.createServiceAccount && assoc.serviceAccount !== "default") {
    //     cluster.addServiceAccount(`${assoc.serviceAccount}ServiceAccount${i}`, {
    //       name: assoc.serviceAccount,
    //       namespace: assoc.namespace,
    //     });
    //   }

    //   new eks.CfnPodIdentityAssociation(this, `PodIdentityAssoc${i}`, {
    //     clusterName: cluster.clusterName,
    //     roleArn,
    //     namespace: assoc.namespace,
    //     serviceAccount: assoc.serviceAccount,
    //   });
    // });

    // still have bugs
    // (config.podIdentityAssociations ?? []).forEach((assoc, i) => {
    //   if (!assoc.role) {
    //     throw new Error(`PodIdentityAssociation[${i}] has no role defined`);
    //   }
    //   // normalize role → always an ARN
    //   const roleArn =
    //     typeof assoc.role === "string" ? assoc.role : assoc.role.roleArn;

    //   // --- 1. Namespace ---
    //   const ns = new eks.KubernetesManifest(this, `Ns-${assoc.namespace}`, {
    //     cluster,
    //     manifest: [
    //       {
    //         apiVersion: "v1",
    //         kind: "Namespace",
    //         metadata: { name: assoc.namespace },
    //       },
    //     ],
    //   });

    //   // ServiceAccount manifest (no cluster.addServiceAccount, avoid cross-stack refs)
    //   const sa = new eks.KubernetesManifest(
    //     this,
    //     `Sa-${assoc.serviceAccount}-${i}`,
    //     {
    //       cluster,
    //       manifest: [
    //         {
    //           apiVersion: "v1",
    //           kind: "ServiceAccount",
    //           metadata: {
    //             name: assoc.serviceAccount,
    //             namespace: assoc.namespace,
    //           },
    //         },
    //       ],
    //     }
    //   );
    //   sa.node.addDependency(ns);

    //   // Pod Identity Association
    //   const assocRes = new eks.CfnPodIdentityAssociation(
    //     this,
    //     `PodIdentityAssoc${i}`,
    //     {
    //       clusterName: cluster.clusterName,
    //       roleArn,
    //       namespace: assoc.namespace,
    //       serviceAccount: assoc.serviceAccount,
    //     }
    //   );

    //   assocRes.node.addDependency(ns);
    //   assocRes.node.addDependency(sa);

    //   //   // --- 2. ServiceAccount (depends on Namespace) ---
    //   //   let saName = assoc.serviceAccount;
    //   //   let saResource: eks.ServiceAccount | undefined;

    //   //   // optional: create service account first
    //   //   if (assoc.createServiceAccount && assoc.serviceAccount !== "default") {
    //   //     saResource = cluster.addServiceAccount(
    //   //       `${assoc.serviceAccount}ServiceAccount${i}`,
    //   //       {
    //   //         name: assoc.serviceAccount,
    //   //         namespace: assoc.namespace,
    //   //       }
    //   //     );
    //   //     saResource.node.addDependency(ns);
    //   //     saName = saResource.serviceAccountName;
    //   //   }

    //   //   // create pod identity association
    //   //   const assocRes = new eks.CfnPodIdentityAssociation(
    //   //     this,
    //   //     `PodIdentityAssoc${i}`,
    //   //     {
    //   //       clusterName: cluster.clusterName,
    //   //       roleArn,
    //   //       namespace: assoc.namespace,
    //   //       serviceAccount: saName,
    //   //     }
    //   //   );
    //   //   // always wait for Namespace
    //   //   assocRes.node.addDependency(ns);

    //   //   // if we created a SA, also wait for SA
    //   //   if (saResource) {
    //   //     assocRes.node.addDependency(saResource);
    //   //   }
    // });

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
