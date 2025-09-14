import {
  CreateSubnetCommand,
  CreateTagsCommand,
  DescribeSubnetsCommand,
  EC2Client,
} from "@aws-sdk/client-ec2";
import { SubnetConfig } from "../models/SubnetConfig";

export class SubnetService {
  constructor(private ec2: EC2Client) {}

  async create(config: SubnetConfig & { vpcId: string }): Promise<string> {
    const subnet = await this.ec2.send(
      new CreateSubnetCommand({
        VpcId: config.vpcId,
        CidrBlock: config.cidrBlock,
        AvailabilityZone: config.availabilityZone,
      })
    );

    const subnetId = subnet.Subnet?.SubnetId!;
    await this.ec2.send(
      new CreateTagsCommand({
        Resources: [subnetId],
        Tags: [{ Key: "Name", Value: config.name }],
      })
    );

    return subnetId;
  }

  async list(): Promise<any[]> {
    const res = await this.ec2.send(new DescribeSubnetsCommand({}));
    return res.Subnets ?? [];
  }
}
