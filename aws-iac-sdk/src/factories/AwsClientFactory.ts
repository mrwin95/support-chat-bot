import { EC2Client } from "@aws-sdk/client-ec2";
import { EnvConfig } from "../models/EnvConfig";

export class AwsClientFactory {
  static createEC2(config: EnvConfig) {
    return new EC2Client(config);
  }
}
