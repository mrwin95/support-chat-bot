import {
  AssociateRouteTableCommand,
  CreateRouteCommand,
  CreateRouteTableCommand,
  CreateTagsCommand,
  EC2Client,
} from "@aws-sdk/client-ec2";
import { RouteTableConfig } from "../models/RouteTableConfig";

export class RouteTableService {
  constructor(private ec2: EC2Client) {}

  async create(
    config: RouteTableConfig & { vpcId: string; igwId?: string }
  ): Promise<string> {
    const rt = await this.ec2.send(
      new CreateRouteTableCommand({ VpcId: config.vpcId })
    );
    const rtId = rt.RouteTable?.RouteTableId!;
    await this.ec2.send(
      new CreateTagsCommand({
        Resources: [rtId],
        Tags: [{ Key: "Name", Value: config.name }],
      })
    );

    if (config.type === "public" && config.igwId) {
      await this.ec2.send(
        new CreateRouteCommand({
          RouteTableId: rtId,
          GatewayId: config.igwId,
          DestinationCidrBlock: "0.0.0.0/0",
        })
      );
    }

    return rtId;
  }

  async associate(rtId: string, subnetId: string): Promise<void> {
    await this.ec2.send(
      new AssociateRouteTableCommand({
        RouteTableId: rtId,
        SubnetId: subnetId,
      })
    );
  }
}
