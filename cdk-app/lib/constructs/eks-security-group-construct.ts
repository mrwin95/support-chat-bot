import { Stack } from "aws-cdk-lib";
import { IVpc, SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export interface EksSecurityGroupProps {
  ssmPrefix: string;
  securityGroupName: string;
  vpc: IVpc;
}

export class EksSecurityGroupConstruct extends Construct {
  public readonly securityGroup: SecurityGroup;

  constructor(scope: Construct, id: string, props: EksSecurityGroupProps) {
    super(scope, id);

    const { ssmPrefix } = props;

    const vpcId = StringParameter.valueForStringParameter(
      this,
      `${ssmPrefix}VpcId`
    );
    // const vpc = Vpc.fromVpcAttributes(this, "ImportedVpc", {
    //   vpcId,
    // });
    this.securityGroup = new SecurityGroup(this, "EksNodeSG", {
      vpc: props.vpc,
      description: "Security group for eks worker node",
      allowAllOutbound: true,
      securityGroupName: props.securityGroupName,
    });

    // export

    new StringParameter(this, "EksNodeSGId", {
      parameterName: `${ssmPrefix}EksNodeSgId`,
      stringValue: this.securityGroup.securityGroupId,
    });
  }
}
