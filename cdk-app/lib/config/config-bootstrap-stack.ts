import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ConfigBootstrapStackProps } from "../interfaces/IConfigBootstrapStackProps";
import * as fs from "fs";
import * as dotenv from "dotenv";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as secrets from "aws-cdk-lib/aws-secretsmanager";

export class ConfigBootstrapStack extends Stack {
  constructor(scope: Construct, id: string, props: ConfigBootstrapStackProps) {
    super(scope, id, props);

    const envFile = `env/.env.${props.envName}`;
    if (!fs.existsSync(envFile)) {
      throw new Error(`Env file ${envFile} not found`);
    }

    const parsed = dotenv.parse(fs.readFileSync(envFile));
    Object.entries(parsed).forEach(([key, value]) => {
      new ssm.StringParameter(this, `Param-${props.envName}-${key}`, {
        stringValue: value,
        tier: ssm.ParameterTier.STANDARD,
      });
    });

    new secrets.Secret(this, `Secret-${props.envName}-config`, {
      secretName: `cdk-app-${props.envName}-config`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify(parsed),
        generateStringKey: "dummy",
      },
    });
  }
}
