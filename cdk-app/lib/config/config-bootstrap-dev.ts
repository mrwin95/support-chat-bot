import { Construct } from "constructs";
import { ConfigBootstrapStack } from "./config-bootstrap-stack";

export class ConfigBootstrapDev extends ConfigBootstrapStack {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      envName: "dev",
      env: {
        account: process.env.AWS_ACCOUNT!,
        region: process.env.AWS_REGION!,
      },
    });
  }
}
