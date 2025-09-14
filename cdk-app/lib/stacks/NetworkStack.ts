import { Stack, StackProps } from "aws-cdk-lib";
// import * as ec2 from "@aws-cdk/aws-ec2";
import { Construct } from "constructs";
import { NetworkConstruct } from "../constructs/network-construct";
import { INetworkConfig } from "../interfaces/INetworkConfig";
export class NetworkStack extends Stack {
  //   public readonly vpc: ec2.Vpc;

  constructor(
    scope: Construct,
    id: string,
    props: StackProps & { config: INetworkConfig }
  ) {
    super(scope, id, props);
    new NetworkConstruct(this, "Network", props.config);
  }
}
