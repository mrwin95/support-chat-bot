import * as eks from "aws-cdk-lib/aws-eks";
import { Construct } from "constructs";
import * as cr from "aws-cdk-lib/custom-resources";
import * as iam from "aws-cdk-lib/aws-iam";
export const ADDON_VERSIONS: Record<
  string,
  { cni: string; coredns: string; kubeProxy: string; ebsCsi: string }
> = {
  "1.33": {
    cni: "v1.20.1-eksbuild.3",
    coredns: "v1.12.4-eksbuild.1",
    kubeProxy: "v1.33.3-eksbuild.6",
    ebsCsi: "v1.48.0-eksbuild.2",
  },
  "1.32": {
    cni: "v1.18.0-eksbuild.1",
    coredns: "v1.11.1-eksbuild.1",
    kubeProxy: "v1.32.0-eksbuild.1",
    ebsCsi: "v1.32.0-eksbuild.1",
  },
};

export function getAddonVersions(cluster: eks.KubernetesVersion) {
  const key = cluster.version;
  if (!(key in ADDON_VERSIONS)) {
    throw new Error(`No addon version mapping found for cluster version ${key}`);
  }

  return ADDON_VERSIONS[key];
}

export function lookupAddonVersion(
  scope: Construct,
  addonName: string,
  k8sVersion: string
) {
  const resource = new cr.AwsCustomResource(scope, `${addonName}VersionLookup`, {
    onUpdate: {
      service: "EKS",
      action: "describeAddonVersions",
      parameters: {
        addonName,
        kubernetesVersion: k8sVersion,
      },
      physicalResourceId: cr.PhysicalResourceId.of(`${addonName}-${k8sVersion}`),
    },
    policy: cr.AwsCustomResourcePolicy.fromStatements([
      new iam.PolicyStatement({
        actions: ["eks:DescribeAddonVersions"],
        resources: ["*"],
      }),
    ]),
  });

  return resource.getResponseField("addons.0.addonVersions.0.addonVersion");
}
