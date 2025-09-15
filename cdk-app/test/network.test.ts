import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { NetworkStack } from "../lib/stacks/network-stack";

test("VPC Created with correct CIDR", () => {
  const app = new cdk.App();
  const stack = new NetworkStack(app, "TestStack", {});
  const template = Template.fromStack(stack);

  template.hasResourceProperties("AWS::EC2::VPC", {
    CidrBlock: "10.0.0.0/16",
  });
});
