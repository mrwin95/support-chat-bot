import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as eks from "aws-cdk-lib/aws-eks";
import { CfnJson, CfnOutput } from "aws-cdk-lib";
import * as ssm from "aws-cdk-lib/aws-ssm";
export interface AlbIamControllerProps {
  cluster: eks.Cluster;
  roleName?: string;
  ssmPrefix?: string;
}

export class AlbIamControllerConstruct extends Construct {
  public readonly role: iam.IRole;
  constructor(scope: Construct, id: string, props: AlbIamControllerProps) {
    super(scope, id);

    const { cluster, roleName } = props;

    // IAM role bound to ServiceAccount via OIDC
    // Use CfnJson to safely map OIDC sub claim → ServiceAccount binding
    const subCondition = new CfnJson(this, "OidcSubCondition", {
      value: {
        [`${cluster.openIdConnectProvider.openIdConnectProviderIssuer}:sub`]:
          "system:serviceaccount:kube-system:aws-load-balancer-controller",
      },
    });

    // IAM role bound to ServiceAccount via OIDC
    this.role = new iam.Role(this, "AlbControllerRole", {
      roleName: roleName ?? "AwsLoadBalancerControllerRole",
      assumedBy: new iam.WebIdentityPrincipal(
        cluster.openIdConnectProvider.openIdConnectProviderArn,
        {
          StringEquals: subCondition,
        }
      ),
    });
    // this.role = new iam.Role(this, "AlbControllerRole", {
    //   roleName: roleName ?? "AwsLoadBalancerControllerRole",
    //   assumedBy: new iam.WebIdentityPrincipal(
    //     cluster.openIdConnectProvider.openIdConnectProviderArn,
    //     {
    //       StringEquals: {
    //         [`${cluster.openIdConnectProvider.openIdConnectProviderIssuer}:sub`]:
    //           "system:serviceaccount:kube-system:aws-load-balancer-controller",
    //       },
    //     }
    //   ),
    // });

    this.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "AmazonEKSLoadBalancerControllerPolicy"
      )
    );

    const albControllerRole = new AlbIamControllerConstruct(
      this,
      "AlbController",
      {
        cluster: cluster,
        roleName: "AwsLoadBalancerControllerRole",
      }
    );

    new ssm.StringParameter(this, "AlbControllerRoleArnParam", {
      parameterName: `${props.ssmPrefix}AlbControllerRoleArn`,
      stringValue: albControllerRole.role.roleArn,
    });

    // new CfnOutput(this, "AlbControllerRoleArnOutput", {
    //   value: albControllerRole.role.roleArn,
    //   exportName: "AlbControllerRoleArn",
    // });

    // this.role = new iam.Role(this, "AlbControllerRole", {
    //   roleName: props.roleName ?? "AwsLoadBalancerControllerRole",
    //   assumedBy: new iam.ServicePrincipal("pods.eks.amazonaws.com"),
    // });

    // Attach inline policy (based on AWS docs)
    // this.role.addToPrincipalPolicy(
    //   new iam.PolicyStatement({
    //     actions: [
    //       "acm:DescribeCertificate",
    //       "acm:ListCertificates",
    //       "acm:GetCertificate",
    //       "ec2:AuthorizeSecurityGroupIngress",
    //       "ec2:CreateSecurityGroup",
    //       "ec2:CreateTags",
    //       "ec2:DeleteTags",
    //       "ec2:DeleteSecurityGroup",
    //       "ec2:Describe*",
    //       "ec2:Modify*",
    //       "elasticloadbalancing:*",
    //       "iam:CreateServiceLinkedRole",
    //       "iam:GetServerCertificate",
    //       "iam:ListServerCertificates",
    //       "iam:PassRole",
    //       "waf-regional:*",
    //       "wafv2:*",
    //       "shield:*",
    //     ],
    //     resources: ["*"],
    //   })
    // );
  }
}
