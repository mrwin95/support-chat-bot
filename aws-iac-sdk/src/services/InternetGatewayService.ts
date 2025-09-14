import {
  AttachInternetGatewayCommand,
  CreateInternetGatewayCommand,
  CreateTagsCommand,
  EC2Client,
} from "@aws-sdk/client-ec2";

export class InternetGatewayService {
  constructor(private ec2: EC2Client) {}

  async createAndAttach(vpcId: string, name: string): Promise<string> {
    const igw = await this.ec2.send(new CreateInternetGatewayCommand({}));
    const igwId = igw.InternetGateway?.InternetGatewayId!;
    await this.ec2.send(
      new AttachInternetGatewayCommand({
        InternetGatewayId: igwId,
        VpcId: vpcId,
      })
    );

    await this.ec2.send(
      new CreateTagsCommand({
        Resources: [igwId],
        Tags: [{ Key: "Name", Value: name }],
      })
    );

    return igwId;
  }
}
