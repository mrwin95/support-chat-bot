import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cdk from "aws-cdk-lib";

export interface EksAdminUserProps {
  eksAdminRoleArn: string;
  userName: string;
}

export class EksAdminUserConstruct extends Construct {
  public readonly user: iam.User;
  public readonly accessKey: iam.CfnAccessKey;

  constructor(scope: Construct, id: string, props: EksAdminUserProps) {
    super(scope, id);

    // create an Iam user

    const userName = props.userName ?? "eks-user-admin";

    this.user = new iam.User(this, "EksAdminUser", {
      userName,
    });

    const assumeRolePolicy = new iam.Policy(this, "EksAdminUserPolicy", {
      statements: [
        new iam.PolicyStatement({
          actions: ["sts:AssumeRole"],
          resources: [props.eksAdminRoleArn],
        }),
      ],
    });

    this.user.attachInlinePolicy(assumeRolePolicy);

    // 3. Access Keys for CLI usage
    this.accessKey = new iam.CfnAccessKey(this, "EksAdminUserAccessKey", {
      userName: this.user.userName,
    });

    new cdk.CfnOutput(this, "EksAdminUserAccessKeyId", {
      value: this.accessKey.ref,
    });

    new cdk.CfnOutput(this, "EksAdminUserSecretAccessKey", {
      value: this.accessKey.attrSecretAccessKey,
      description: "Save this securely! Will only be shown once.",
    });
  }
}
