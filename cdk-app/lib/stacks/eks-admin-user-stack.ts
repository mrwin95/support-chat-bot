import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { EksAdminUserConstruct } from "../constructs/eks-admin-user-construct";

export interface EksAdminUserStackProps extends StackProps {
  ssmPrefix: string;
  userName: string;
}

export class EksAdminUserStack extends Stack {
  constructor(scope: Construct, id: string, props: EksAdminUserStackProps) {
    super(scope, id);

    // read arn from ssm

    const eksAdminRoleArn = ssm.StringParameter.valueForStringParameter(
      this,
      `${props.ssmPrefix}EksAdminRoleArn`
    );
    // add policy

    new EksAdminUserConstruct(this, "EksAdminUserConstruct", {
      eksAdminRoleArn: eksAdminRoleArn,
      userName: props.userName,
      ssmPrefix: props.ssmPrefix,
    });

    new CfnOutput(this, "EksAdminRoleFromSSM", {
      value: eksAdminRoleArn,
      description: "EKS Admin Role ARN loaded from SSM",
    });
  }
}
