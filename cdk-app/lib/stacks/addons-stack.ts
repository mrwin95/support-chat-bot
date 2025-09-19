import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  EksAddOnConfig,
  EksAddOnConstruct,
} from "../constructs/eks-addons-construct";
import * as eks from "aws-cdk-lib/aws-eks";
export interface EksAddOnProps extends StackProps {
  cluster: eks.Cluster;
  addOnConfig: EksAddOnConfig;
}

export class EksAddOnStack extends Stack {
  constructor(scope: Construct, id: string, props: EksAddOnProps) {
    super(scope, id, props);

    new EksAddOnConstruct(this, "EksAddOns", props.cluster, props.addOnConfig);
  }
}
