import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { EcrRepoConstruct } from "../constructs/ecr-repo-construct";

export class EcrStack extends Stack {
  public readonly backendRepoUri: string;
  public readonly frontendRepoUri: string;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const backendRepo = new EcrRepoConstruct(this, "BackendRepo", {
      repoName: "demo-backend",
      lifecycleDays: 2,
    });

    const frontendRepo = new EcrRepoConstruct(this, "FrontendRepo", {
      repoName: "demo-frontend",
      lifecycleDays: 2,
    });

    this.backendRepoUri = backendRepo.repository.registryUri;
    this.frontendRepoUri = frontendRepo.repository.registryUri;

    new CfnOutput(this, "BackendRepoUri", {
      value: this.backendRepoUri,
    });

    new CfnOutput(this, "FrontendRepoUri", {
      value: this.frontendRepoUri,
    });
  }
}
