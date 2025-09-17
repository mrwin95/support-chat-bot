import { Construct } from "constructs";
import * as eks from "aws-cdk-lib/aws-eks";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { IEksConfig } from "../interfaces/IEksConfig";
export class EksNodeGroupConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    cluster: eks.Cluster,
    vpc: ec2.IVpc,
    subnets: ec2.ISubnet[],
    config: IEksConfig
  ) {
    super(scope, id);

    cluster.addNodegroupCapacity(config.clusterName, {
      desiredSize: config.desiredSize ?? 2,
      minSize: config.minSize ?? 1,
      maxSize: config.maxSize ?? 2,
      instanceTypes: [new ec2.InstanceType(config.instanceType)],
      subnets: { subnets: subnets },
    });
  }
}
