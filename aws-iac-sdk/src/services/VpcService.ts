import distTypes = require("@aws-sdk/client-ec2");

import {
  CreateTagsCommand,
  DeleteVpcCommand,
  EC2Client,
} from "@aws-sdk/client-ec2";
import { VpcConfig } from "../models/VpcConfig";
import { IResource } from "../interfaces/IResource";

export class VpcService implements IResource<VpcConfig> {
  private ec2: distTypes.EC2Client;
  constructor(region: string) {
    this.ec2 = new EC2Client({ region: region });
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
