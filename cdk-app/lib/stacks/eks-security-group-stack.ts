import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { EksSecurityGroupConstruct } from "../constructs/eks-security-group-construct";
import { ISecurityGroup, IVpc, Vpc } from "aws-cdk-lib/aws-ec2";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export interface EksSecurityGroupStackProps extends StackProps {
  securityGroupName: string;
  ssmPrefix: string;
  vpcId: string;
  //   eksNodeSg: ISecurityGroup; // 👈 inside eksConfig
}

export class EksSecurityGroupStack extends Stack {
  public readonly securityGroupId: string;
  public readonly securityGroupName: string;
  public readonly eksSg: ISecurityGroup;

  constructor(scope: Construct, id: string, props: EksSecurityGroupStackProps) {
    super(scope, id, props);

    // Lookup VPC this just for hardcode name
    // const vpc = Vpc.fromLookup(this, "Vpc", {
    //   vpcId: `${props.vpcId}`,
    // });
    const vpcId = StringParameter.valueForStringParameter(
      this,
      `${props.ssmPrefix}VpcId`
    );
    const vpc = Vpc.fromVpcAttributes(this, "ImportedVpc", {
      vpcId,
      availabilityZones: this.availabilityZones,
    });
    // create additional SG
    const eksSgConstruct = new EksSecurityGroupConstruct(
      this,
      "EksAdditionalSGConstruct",
      {
        vpc,
        securityGroupName: props.securityGroupName,
        ssmPrefix: props.ssmPrefix,
        description: "Custom SG for EKS workloads (reusable)",
      }
    );

    this.eksSg = eksSgConstruct.securityGroup;
  }
}
