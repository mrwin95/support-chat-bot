import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { EksSecurityGroupConstruct } from "../constructs/eks-security-group-construct";
import { IVpc } from "aws-cdk-lib/aws-ec2";

export interface EksSecurityGroupStackProps extends StackProps {
  securityGroupName: string;
  ssmPrefix: string;
  vpc: IVpc;
}

export class EksSecurityGroupStack extends Stack {
  public readonly securityGroupId: string;
  public readonly securityGroupName: string;
  constructor(scope: Construct, id: string, props: EksSecurityGroupStackProps) {
    super(scope, id, props);

    new EksSecurityGroupConstruct(this, "EksSG", {
      securityGroupName: props.securityGroupName,
      ssmPrefix: props.ssmPrefix,
      vpc: props.vpc,
    });
  }
}
