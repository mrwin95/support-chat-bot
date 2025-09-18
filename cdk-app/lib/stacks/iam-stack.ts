import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { IamConstruct, IamConstructProps } from "../constructs/iam-construct";

export interface IamStackProps extends StackProps, IamConstructProps {}
export class IamStack extends Stack {
  public readonly iam: IamConstruct;

  constructor(scope: Construct, id: string, props: IamStackProps) {
    super(scope, id);

    this.iam = new IamConstruct(this, "IamConstruct", {
      adminRoleName: props.adminRoleName,
      workerRoleName: props.workerRoleName,
      ssmPrefix: props.ssmPrefix,
      importOnly: false,
      roleTags: {
        Environment: "dev",
        Project: "solid-eks",
      },
    });
    // Export ARNs so other stacks can import if needed
  }
}
