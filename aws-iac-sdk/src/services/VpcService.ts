import distTypes = require("@aws-sdk/client-ec2");

import {
  CreateTagsCommand,
  DeleteVpcCommand,
  DescribeVpcsCommand,
  EC2Client,
} from "@aws-sdk/client-ec2";
import { VpcConfig } from "../models/VpcConfig";
import { IResource } from "../interfaces/IResource";

export class VpcService implements IResource<VpcConfig> {
  constructor(private ec2: EC2Client) {}

  async ensureVpc(cidrBlock: string, tagName: string): Promise<string> {
    const existing = await this.ec2.send(
      new DescribeVpcsCommand({
        Filters: [{ Name: "tag:Name", Values: [tagName] }],
      })
    );

    if (existing.Vpcs && existing.Vpcs.length > 0) {
      const vpc = existing.Vpcs[0];
      console.log(`Reusing VPC: ${vpc?.VpcId}`);
      return vpc?.VpcId!;
    }

    const result = await this.ec2.send(
      new distTypes.CreateVpcCommand({
        CidrBlock: cidrBlock,
        TagSpecifications: [
          {
            ResourceType: "vpc",
            Tags: [{ Key: "Name", Value: tagName }],
          },
        ],
      })
    );

    return result.Vpc?.VpcId!;
  }
  async createVpc(config: VpcConfig): Promise<string> {
    const vpc = await this.ec2.send(
      new distTypes.CreateVpcCommand({ CidrBlock: config.cidrBlock })
    );
    const vpcId = vpc.Vpc?.VpcId!;

    // add tag
    await this.ec2.send(
      new CreateTagsCommand({
        Resources: [vpcId],
        Tags: [
          {
            Key: "Name",
            Value: config.name,
          },
        ],
      })
    );

    console.log(`Created VPC: ${vpcId} (${config.cidrBlock})`);

    return vpcId;
  }
  async listVpcs(): Promise<any> {
    const res = await this.ec2.send(new distTypes.DescribeVpcsCommand({}));
    return res.Vpcs ?? [];
  }

  async deleteVpc(vpcId: string): Promise<void> {
    await this.ec2.send(new DeleteVpcCommand({ VpcId: vpcId }));
    console.log(`Deleted VPC: ${vpcId} (${vpcId})`);
  }
}
