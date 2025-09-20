import { Construct } from "constructs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import { Duration } from "aws-cdk-lib";

export interface EcrRepoConstructProps {
  repoName: string;
  lifecycleDays?: number;
}

export class EcrRepoConstruct extends Construct {
  public readonly repository: ecr.Repository;
  constructor(scope: Construct, id: string, props: EcrRepoConstructProps) {
    super(scope, id);

    this.repository = new ecr.Repository(this, props.repoName, {
      repositoryName: props.repoName,
      imageScanOnPush: true,
    });

    if (props.lifecycleDays) {
      this.repository.addLifecycleRule({
        description: "Expired old images",
        maxImageAge: Duration.days(props.lifecycleDays),
      });
    }
  }
}
