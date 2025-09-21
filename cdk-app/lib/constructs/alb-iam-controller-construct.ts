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
  }
}
