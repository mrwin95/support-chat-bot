import { Construct } from "constructs";
import { INetworkConfig } from "../interfaces/INetworkConfig";
import { VpcConstruct } from "./vpc-construct";
import { RoutingConstruct } from "./routing-construct";
import { NatGatewayConstruct } from "./natgateway-construct";
import { SubnetConstruct } from "./subnet-construct";

export class NetworkConstruct extends Construct {
  constructor(scope: Construct, id: string, config: INetworkConfig) {
    super(scope, id);

    const vpc = new VpcConstruct(this, "Vpc", config.cidr, config.maxAzs);

    const publicSubnets = new SubnetConstruct(
      this,
      "Public",
      vpc.vpc,
      config.publicCidrs,
      true
    );
    const privateSubnets = new SubnetConstruct(
      this,
      "Private",
      vpc.vpc,
      config.privateCidrs,
      false
    );

    let natGw;
    if ((config.natGateways ?? 1) > 0) {
      natGw = new NatGatewayConstruct(
        this,
        "NatGateway",
        publicSubnets.subnets[0]
      ).natGw;
    }

    new RoutingConstruct(
      this,
      "Routing",
      vpc.vpc,
      publicSubnets.subnets,
      privateSubnets.subnets,
      natGw
    );
  }
}
