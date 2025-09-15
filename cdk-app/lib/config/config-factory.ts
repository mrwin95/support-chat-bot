import { IEnvConfig } from "../interfaces/IEnvConfig";
import * as dotenv from "dotenv";
import * as ec2 from "aws-cdk-lib/aws-ec2";
export class ConfigFactory {
  static async load(env: string): Promise<IEnvConfig> {
    dotenv.config({ path: `env/.env.${env}` });

    if (!process.env.AWS_ACCOUNT || !process.env.AWS_REGION) {
      throw new Error(`Missing AccountId or region in .env.${env}`);
    }
    return {
      envName: env,
      awsAccount: process.env.AWS_ACCOUNT,
      awsRegion: process.env.AWS_REGION,
      network: {
        ipAddresses: ec2.IpAddresses.cidr(process.env.VPC_CIDR!),
        maxAzs: Number(process.env.MAX_AZS!),
        natGateways: Number(process.env.NAT_GATEWAY!),
        // subnetConfiguration: [],
      },
    };
  }
}
