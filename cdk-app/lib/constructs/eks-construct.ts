import { Construct } from "constructs";
import { IEksConfig } from "../interfaces/IEksConfig";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { EksClusterConstruct } from "./eks-cluster-construct";
import { EksNodeGroupConstruct } from "./eks-nodegroup-construct";

export class EksConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    vpc: ec2.IVpc,
    privateSubnets: ec2.ISubnet[],
    publicSubnets: ec2.ISubnet[],
    config: IEksConfig
  ) {
    super(scope, id);

    const { cluster } = new EksClusterConstruct(this, "Cluster", vpc, config);
    new EksNodeGroupConstruct(
      this,
      "NodeGroup",
      cluster,
      vpc,
      privateSubnets,
      config
    );
  }
}
