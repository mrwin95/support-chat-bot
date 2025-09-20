import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { CfnOutput, Stack, Tags } from "aws-cdk-lib";
import { AlbIamControllerConstruct } from "./alb-iam-controller-construct";

export interface PodIdentityRoleConfig {
  roleName: string;
  namespace: string;
  serviceAccount: string;
  managedPolicies?: iam.IManagedPolicy[];
}
export interface IamConstructProps {
  adminRoleName: string;
  workerRoleName: string;
  podIdentityRoles?: {
    roleName: string;
    managedPolicies?: iam.IManagedPolicy[];
  }[];
  ssmPrefix?: string;
  importOnly?: boolean; // 👈 new flag to indicate "just import" mode
  roleTags?: { [Key: string]: string };
}
export class IamConstruct extends Construct {
  public readonly adminRole: iam.IRole;
  public readonly workerRole: iam.IRole;
  public readonly podIdentityRoles: Record<string, iam.IRole> = {};
  public readonly albControllerRoleArn: string;

  constructor(scope: Construct, id: string, config: IamConstructProps) {
    super(scope, id);

    const stack = Stack.of(this);
    // EKS admin role

    const contextAdminArn = stack.node.tryGetContext("eksAdminRoleArn");
    const contextWorkerArn = stack.node.tryGetContext("eksWorkerRoleArn");

    if (contextAdminArn && contextWorkerArn) {
      this.adminRole = iam.Role.fromRoleArn(
        this,
        "ImportedAdminRole",
        contextAdminArn,
        {
          mutable: false,
        }
      );
      this.workerRole = iam.Role.fromRoleArn(
        this,
        "ImportedWorkerRole",
        contextWorkerArn,
        {
          mutable: false,
        }
      );

      return;
    }

    // try ssm
    let ssmAdminParam: ssm.IStringParameter | undefined;
    let ssmWorkerParam: ssm.IStringParameter | undefined;

    if (config.importOnly && config.ssmPrefix) {
      ssmAdminParam = ssm.StringParameter.fromStringParameterName(
        this,
        "EksAdminRoleParam",
        `${config.ssmPrefix}EksAdminRoleArn`
      );
      ssmWorkerParam = ssm.StringParameter.fromStringParameterName(
        this,
        "EksWorkerRoleParam",
        `${config.ssmPrefix}EksWorkerRoleArn`
      );
    }

    if (ssmAdminParam && ssmWorkerParam) {
      this.adminRole = iam.Role.fromRoleArn(
        this,
        "ImportedAdminRoleSSM",
        ssmAdminParam.stringValue,
        {
          mutable: false,
        }
      );

      this.workerRole = iam.Role.fromRoleArn(
        this,
        "ImportedWorkerRoleSSM",
        ssmWorkerParam.stringValue,
        {
          mutable: false,
        }
      );

      return;
    }

    // create admin if nothing exists

    this.adminRole = new iam.Role(this, "EksAdminRole", {
      roleName: config.adminRoleName,
      assumedBy: new iam.AccountRootPrincipal(),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"),
      ],
    });

    this.workerRole = new iam.Role(this, "EksWorkerRole", {
      roleName: config.workerRoleName,
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKSWorkerNodePolicy"),
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "AmazonEC2ContainerRegistryReadOnly"
        ),
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKS_CNI_Policy"),
      ],
    });

    // identity role

    (config.podIdentityRoles ?? []).forEach((roleConfig, i) => {
      const role = new iam.Role(this, `PodIdentityRole${i}`, {
        roleName: roleConfig.roleName,
        assumedBy: new iam.ServicePrincipal("pods.eks.amazonaws.com"), // 👈 strict
        managedPolicies: roleConfig.managedPolicies ?? [
          iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3ReadOnlyAccess"),
        ],
      });
      this.podIdentityRoles[roleConfig.roleName] = role;

      if (config.ssmPrefix) {
        new ssm.StringParameter(this, `PodIdentityRoleArnParam${i}`, {
          parameterName: `${config.ssmPrefix}${roleConfig.roleName}Arn`,
          stringValue: role.roleArn,
        });
      }

      new CfnOutput(this, `PodIdentityRoleArn${i}`, { value: role.roleArn });
    });

    // set tags

    if (config.roleTags) {
      for (const [k, v] of Object.entries(config.roleTags)) {
        Tags.of(this.adminRole).add(k, v);
        Tags.of(this.workerRole).add(k, v);
      }
    }

    // Always set Name ta
    Tags.of(this.adminRole).add("Name", `${config.adminRoleName}`);
    Tags.of(this.workerRole).add("Name", `${config.workerRoleName}`);
    // store newly create to ARNS

    if (config.ssmPrefix) {
      new ssm.StringParameter(this, "EksAdminRoleArnParam", {
        parameterName: `${config.ssmPrefix}EksAdminRoleArn`,
        stringValue: this.adminRole.roleArn,
      });
      new ssm.StringParameter(this, "EksWorkerRoleArnParam", {
        parameterName: `${config.ssmPrefix}EksWorkerRoleArn`,
        stringValue: this.workerRole.roleArn,
      });
    }

    new CfnOutput(this, "EksAdminRoleArnOutput", {
      value: this.adminRole.roleArn,
      exportName: "EksAdminRoleArn",
    });
    new CfnOutput(this, "EksWorkerRoleArnOutput", {
      value: this.workerRole.roleArn,
      exportName: "EksWorkerRoleArn",
    });
  }
}
