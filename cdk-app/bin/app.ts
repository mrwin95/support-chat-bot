#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ConfigBootstrapDev } from "../lib/config/config-bootstrap-dev";
// import { NetworkStack } from "../lib/stacks/NetworkStack";
import * as dotenv from "dotenv";
import { NetworkStack } from "../lib/stacks/network-stack";
// import { CdkAppStack } from "../lib/cdk-app-stack";
// import { NetworkStack } from "../lib/stacks/NetworkStack";

dotenv.config({ path: `env/.env.${process.env.ENV || "dev"}` });

const app = new cdk.App();

const envProps = {
  account: process.env.AWS_ACCOUNT,
  region: process.env.AWS_REGION,
};

// Deploy bootstrap dependencies

// new ConfigBootstrapDev(app, "ConfigBootstrapDev");
// const network = new NetworkStack(app, `NetworkStack-${process.env.CDK_ENV}`, {
//   env: envProps,
//   cidr: process.env.VPC_CIDR!,
//   maxAzs: Number(process.env.MAX_AZS),
//   natGateways: Number(process.env.NAT_GATEWAYS),
// });

const network = new NetworkStack(app, 'NetworkStack', {
    
})
// new CdkAppStack(app, 'CdkAppStack', {
/* If you don't specify 'env', this stack will be environment-agnostic.
 * Account/Region-dependent features and context lookups will not work,
 * but a single synthesized template can be deployed anywhere. */

/* Uncomment the next line to specialize this stack for the AWS Account
 * and Region that are implied by the current CLI configuration. */
// env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

/* Uncomment the next line if you know exactly what Account and Region you
 * want to deploy the stack to. */
// env: { account: '123456789012', region: 'us-east-1' },

/* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
// });
