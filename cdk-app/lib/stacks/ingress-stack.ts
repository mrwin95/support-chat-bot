import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as eks from "aws-cdk-lib/aws-eks";
import { NginxIngressConstruct } from "../constructs/nginx-ingress-construct";

export interface IngressStackProps extends StackProps {
  cluster: eks.Cluster;
}

export class IngressStack extends Stack {
  constructor(scope: Construct, id: string, props: IngressStackProps) {
    super(scope, id, props);

    new NginxIngressConstruct(this, "IngressConstruct", {
      cluster: props.cluster,
    });
  }
}
