import { EC2Client } from "@aws-sdk/client-ec2";

export class AwsClientFactory {
  static createEC2(region: string) {
    return new EC2Client({ region });
  }
}
