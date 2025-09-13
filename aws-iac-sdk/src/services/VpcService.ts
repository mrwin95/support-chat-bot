import distTypes = require("@aws-sdk/client-ec2");
import type INetworkService = require("../interfaces/INetworkService");
import { CreateTagsCommand, EC2Client } from "@aws-sdk/client-ec2";

export class VpcService implements INetworkService.INetworkService {
  private ec2: distTypes.EC2Client;
  constructor(region: string) {
    this.ec2 = new EC2Client({ region: region });
  }
  async createVpc(cidrBlock: string, name: string): Promise<string> {
    const vpc = await this.ec2.send(
      new distTypes.CreateVpcCommand({ CidrBlock: cidrBlock })
    );
    const vpcId = vpc.Vpc?.VpcId!;

    // add tag
    await this.ec2.send(
      new CreateTagsCommand({
        Resources: [vpcId],
        Tags: [
          {
            Key: "Name",
            Value: name,
          },
        ],
      })
    );

    console.log(`Created VPC: ${vpcId} (${cidrBlock})`);

    return vpcId;
  }
  listVpcs(): Promise<{ vpcId: string; cidrBlock: string; name?: string }> {
    throw new Error("Method not implemented.");
  }
  deleteVpc(vpcId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
