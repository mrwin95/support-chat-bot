import { StackProps } from "aws-cdk-lib";

export interface ConfigBootstrapStackProps extends StackProps {
  envName: string;
}
