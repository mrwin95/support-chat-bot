import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

import * as ssm from "aws-cdk-lib/aws-ssm";
import { IrsaRoleConstruct } from "../constructs/irsa-role-construct";
import * as iam from "aws-cdk-lib/aws-iam";

export interface IrsaRoleStackProps extends StackProps {
  ssmPrefix: string;
}

export class EksIrsaRoleStack extends Stack {
  constructor(scope: Construct, id: string, props: IrsaRoleStackProps) {
    super(scope, id, props);

    // get OIDC

    const oidcProviderArn = ssm.StringParameter.valueForStringParameter(
      this,
      `${props.ssmPrefix}OidcProviderArn`
    );

    // import provider
    const oidcProvider = iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
      this,
      "ImportedOidcProvider",
      oidcProviderArn
    );
    // const cluster = props.clusterStack;

    new IrsaRoleConstruct(this, "AlbControllerRole", {
      oidcProvider: oidcProvider,
      //   cluster,
      namespace: "kube-system",
      serviceAccountName: "aws-load-balancer-controller",
      roleName: "EksAlbControllerRole",
      policyStatements: [
        new iam.PolicyStatement({
          actions: [
            "elasticloadbalancing:*",
            "ec2:Describe*",
            "ec2:AuthorizeSecurityGroupIngress",
          ],
          resources: ["*"],
        }),
      ],
    });
  }
}
