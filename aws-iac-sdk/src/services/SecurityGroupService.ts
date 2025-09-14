import {
  AuthorizeSecurityGroupIngressCommand,
  CreateSecurityGroupCommand,
  CreateTagsCommand,
  EC2Client,
} from "@aws-sdk/client-ec2";
import { SecurityGroupConfig } from "../models/SecurityGroupConfig";

export class SecurityGroupService {
  constructor(private ec2: EC2Client) {}

  async create(
    config: SecurityGroupConfig & { vpcId: string }
  ): Promise<string> {
    const sg = await this.ec2.send(
      new CreateSecurityGroupCommand({
        VpcId: config.vpcId,
        GroupName: config.name,
        Description: config.description,
      })
    );

    const sgId = sg.GroupId!;

    // add tags
    await this.ec2.send(
      new CreateTagsCommand({
        Resources: [sgId],
        Tags: [{ Key: "Name", Value: config.name }],
      })
    );

    // add ingress rule

    for (const rule of config.ingressRules) {
      await this.ec2.send(
        new AuthorizeSecurityGroupIngressCommand({
          GroupId: sgId,
          IpPermissions: [
            {
              IpProtocol: rule.protocol,
              FromPort: rule.fromPort,
              ToPort: rule.toPort,
              IpRanges: [{ CidrIp: rule.cidr }],
            },
          ],
        })
      );
    }

    return sgId;
  }
}
