import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { IamConstruct, IamConstructProps } from "../constructs/iam-construct";

export interface IamStackProps extends StackProps, IamConstructProps {}
export class IamStack extends Stack {
  public readonly iam: IamConstruct;

  constructor(scope: Construct, id: string, props: IamStackProps) {
    super(scope, id, props);

    this.iam = new IamConstruct(this, "IamConstruct", {
      adminRoleName: props.adminRoleName,
      workerRoleName: props.workerRoleName,
      ssmPrefix: props.ssmPrefix,
      podIdentityRoles: props.podIdentityRoles,
      importOnly: props.importOnly ?? false,
      roleTags: {
        Environment: "dev",
        Project: "solid-eks",
      },
    });

    // Export ARNs for use in other stacks (EksStack, AddOnStack, etc.)
    // new CfnOutput(this, "EksAdminRoleArnExport", {
    //   value: this.iam.adminRole.roleArn,
    //   exportName: "EksAdminRoleArn",
    // });

    // new CfnOutput(this, "EksWorkerRoleArnExport", {
    //   value: this.iam.workerRole.roleArn,
    //   exportName: "EksWorkerRoleArn",
    // });

    // Object.entries(this.iam.podIdentityRoles).forEach(([name, role], idx) => {
    //   new CfnOutput(this, `PodIdentityRole${idx}ArnExport`, {
    //     value: role.roleArn,
    //     exportName: `${name}Arn`,
    //   });
    // });

    // Export ARNs so other stacks can import if needed
  }
}
