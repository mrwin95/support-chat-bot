import * as dotenv from "dotenv";
import { EnvConfig } from "../models/EnvConfig";
import { devConfig } from "./dev";
import { prodConfig } from "./prod";
import { stagingConfig } from "./staging";

dotenv.config();
type Environments = "dev" | "staging" | "prod";

const configs: Record<Environments, EnvConfig> = {
  dev: devConfig,
  staging: stagingConfig,
  prod: prodConfig,
};

export function loadConfig(): EnvConfig {
  const env = (process.env.ENV || "dev") as Environments;

  if (!configs[env]) {
    throw new Error(`Unknown environment: ${env}`);
  }

  switch (env) {
    case "dev":
      return {
        name: "dev",
        accountId: process.env.DEV_ACCOUNT_ID!,
        roleArn: process.env.DEV_ROLE_ARN!,
        region: process.env.DEV_REGION!,
        vpc: { cidrBlock: "10.20.0.0/16", name: "DevVPC" },
        subnets: [
          {
            cidrBlock: "10.20.128.0/20",
            name: "DevSubnetPublicA",
            availabilityZone: `${process.env.DEV_REGION}a`,
            type: "public",
          },
          {
            cidrBlock: "10.20.0.0/19",
            name: "DevSubnetPrivateB",
            availabilityZone: `${process.env.DEV_REGION}b`,
            type: "private",
          },
        ],
        securityGroups: [
          {
            name: "DevWebSG",
            description: "Allow HTTP/HTTPS",
            ingressRules: [
              { protocol: "tcp", fromPort: 80, toPort: 80, cidr: "0.0.0.0/0" },
              { protocol: "tcp", fromPort: 443, toPort: 443, cidr: "0.0.0.0/0" },
            ],
          },
        ],
      };

    default:
      throw new Error(`❌ Unknown environment: ${env}`);
  }
  //   console.log(`Loaded ${env.toLocaleLowerCase()} environment`);
  //   return configs[env];
}
