import { Stack } from "aws-cdk-lib";
import { IVpc, Port, SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export interface EksSecurityGroupProps {
  ssmPrefix: string;
  securityGroupName: string;
  vpc: IVpc;
  description?: string;
}

export class EksSecurityGroupConstruct extends Construct {
  public readonly securityGroup: SecurityGroup;

  constructor(scope: Construct, id: string, props: EksSecurityGroupProps) {
    super(scope, id);

    const { vpc, ssmPrefix, description, securityGroupName } = props;

    // const vpcId = StringParameter.valueForStringParameter(
    //   this,
    //   `${ssmPrefix}VpcId`
    // );
    // const vpc = Vpc.fromVpcAttributes(this, "ImportedVpc", {
    //   vpcId,
    // });
    this.securityGroup = new SecurityGroup(this, "EksAdditionalSG", {
      vpc,
      description: "Additional SG for EKS workloads",
      allowAllOutbound: true,
      securityGroupName: props.securityGroupName ?? "EksAdditionalSG",
    });

    // allow all traffic inside node to node
    this.securityGroup.addIngressRule(
      this.securityGroup,
      Port.allTraffic(),
      "Allow node-to-node communication"
    );

    // export SG ID to SSM for reuse in other stacks

    new StringParameter(this, "EksAdditionalSGIdParam", {
      parameterName: `${ssmPrefix}EksAdditionalSGId`,
      stringValue: this.securityGroup.securityGroupId,
    });
  }
}
