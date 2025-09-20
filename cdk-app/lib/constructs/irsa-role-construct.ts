import { Construct } from "constructs";
import * as eks from "aws-cdk-lib/aws-eks";

import * as iam from "aws-cdk-lib/aws-iam";
import { CfnJson } from "aws-cdk-lib";
export interface IrsaRoleConstructProps {
  //   cluster: eks.Cluster;
  oidcProvider: iam.IOpenIdConnectProvider;
  namespace?: string;
  serviceAccountName?: string;
  roleName?: string;
  policyStatements?: iam.PolicyStatement[];
}

export class IrsaRoleConstruct extends Construct {
  public readonly role: iam.IRole;
  constructor(scope: Construct, id: string, props: IrsaRoleConstructProps) {
    super(scope, id);

    // reference the cluster OIDC

    const oidcProvider = props.oidcProvider;
    if (!oidcProvider) {
      throw new Error("Cluster must have OIDC provider enable");
    }

    const stringEqualsJson = new CfnJson(this, "IrsaCondition", {
      value: {
        [`${oidcProvider.openIdConnectProviderIssuer}:sub`]: `system:serviceaccount:${props.namespace}:${props.serviceAccountName}`,
      },
    });

    this.role = new iam.Role(this, props.roleName ?? "EksAlbControllerRole", {
      roleName: props.roleName,
      assumedBy: new iam.FederatedPrincipal(
        oidcProvider.openIdConnectProviderArn,
        {
          StringEquals: stringEqualsJson,
          //arn:aws:iam::442042528400:oidc-provider/oidc.eks.ca-central-1.amazonaws.com/id/D1CA25A76DAE36C9B7EEC3BD540F9BD9
        },
        "sts:AssumeRoleWithWebIdentity"
      ),
    });

    props.policyStatements?.forEach((p) => this.role.addToPrincipalPolicy(p));
  }
}
