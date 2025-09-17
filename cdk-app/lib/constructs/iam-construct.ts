import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";

export interface IamConstructProps {
  roleName: string;
  userArns?: string[];
}
export class IamConstruct extends Construct {
  public readonly eksAdminRole: iam.Role;
  public readonly workerAdminRole: iam.Role;

  constructor(scope: Construct, id: string, config: IamConstructProps) {
    super(scope, id);

    // EKS admin role

    this.eksAdminRole = new iam.Role(this, "EksAdminRole", {
      assumedBy: new iam.AccountRootPrincipal(),
      roleName: config.roleName,
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKSClusterPolicy"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKSServicePolicy"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEC2FullAccess"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("IAMFullAccess"),
      ],
    });

    if (config.userArns && config.userArns.length > 0) {
      this.eksAdminRole.assumeRolePolicy?.addStatements(
        new iam.PolicyStatement({
          actions: ["sts:AssumeRole"],
          principals: config.userArns.map((arn) => new iam.ArnPrincipal(arn)),
        })
      );
    }

    // Worker node iam role

    this.workerAdminRole = new iam.Role(this, "EksWorkerNodeRole", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKSWorkerNodePolicy"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKS_CNI_Policy"),
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "AmazonEC2ContainerRegistryReadOnly"
        ),
      ],
    });
  }
}
