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
            "ec2:AuthorizeSecurityGroupIngress",
            "ec2:CreateSecurityGroup",
            "ec2:DeleteSecurityGroup",
            "ec2:AuthorizeSecurityGroupIngress",
            "ec2:RevokeSecurityGroupIngress",
            "shield:GetSubscriptionState",
            "shield:DescribeProtection",
            "shield:CreateProtection",
            "shield:DeleteProtection",
            "shield:DescribeSubscription",
            "ec2:*",
            "elasticloadbalancing:*",
            "acm:DescribeCertificate",
            "acm:ListCertificates",
            "acm:GetCertificate",
            "ec2:AuthorizeSecurityGroupIngress",
            "ec2:CreateSecurityGroup",
            "ec2:CreateTags",
            "ec2:DeleteTags",
            "ec2:DeleteSecurityGroup",
            "ec2:Describe*",
            "ec2:Modify*",
            "elasticloadbalancing:*",
            "iam:CreateServiceLinkedRole",
            "iam:GetServerCertificate",
            "iam:ListServerCertificates",
            "iam:PassRole",
            "waf-regional:*",
            "wafv2:*",
            "shield:*",
          ],
          resources: ["*"],
        }),
      ],
    });
  }
}
