import {
  AllocateAddressCommand,
  CreateNatGatewayCommand,
  CreateTagsCommand,
  DescribeNatGatewaysCommand,
  EC2Client,
} from "@aws-sdk/client-ec2";

export class NatGatewayService {
  constructor(private ec2: EC2Client) {}

  async create(subnetId: string, name: string) {
    const eip = await this.ec2.send(
      new AllocateAddressCommand({
        Domain: "vpc",
      })
    );
    const allocationId = eip.AllocationId!;

    const nat = await this.ec2.send(
      new CreateNatGatewayCommand({
        SubnetId: subnetId,
        AllocationId: allocationId,
      })
    );

    const natId = nat.NatGateway?.NatGatewayId!;

    await this.ec2.send(
      new CreateTagsCommand({
        Resources: [natId],
        Tags: [
          {
            Key: "Name",
            Value: name,
          },
        ],
      })
    );

    // wait until available
    let ready = false;
    while (!ready) {
      const status = await this.ec2.send(
        new DescribeNatGatewaysCommand({
          NatGatewayIds: [natId],
        })
      );

      ready = status.NatGateways?.[0]?.State === "available";
      if (!ready) {
        console.log(`Waiting for NAT...`);
        await new Promise((res) => setTimeout(res, 5000));
      }
    }

    return natId;
  }
}
