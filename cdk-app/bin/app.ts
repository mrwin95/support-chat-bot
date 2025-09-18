#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import * as dotenv from "dotenv";
import { NetworkStack } from "../lib/stacks/network-stack";
import { EksStack } from "../lib/stacks/eks-stack";
import { bootstrap } from "../lib/stacks/bootstrap-stack";

dotenv.config({ path: `env/.env.${process.env.ENV || "dev"}` });

const app = new cdk.App();

const envProps = {
  account: process.env.AWS_ACCOUNT,
  region: process.env.AWS_REGION,
};

bootstrap(app, envProps);
app.synth();
// const networkStack = new NetworkStack(app, "NetworkStack", {
//   env: envProps,
// });

// new EksStack(app, "EksStack", networkStack.network, {
//   env: envProps,
// });

// const network = new NetworkStack(app, 'NetworkStack', {

// })
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
