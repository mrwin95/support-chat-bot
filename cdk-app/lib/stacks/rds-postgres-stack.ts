import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { RdsPostgresConstruct } from "../constructs/rds-postgres-construct";
import { NetworkConstruct } from "../constructs/network-construct";

export interface RdsPostgresStackProps extends StackProps {
  network: NetworkConstruct;
  ssmPrefix: string;
}

export class RdsPostgresStack extends Stack {
  constructor(scope: Construct, id: string, props: RdsPostgresStackProps) {
    super(scope, id, props);

    const { ssmPrefix, network } = props;
    new RdsPostgresConstruct(this, "PostgresRds", {
      dbIdentifier: "solid-postgres-db",
      securityGroupName: "solid-rds-postgres-sg",
      ssmPrefix,
      vpc: props.network.vpc,
      dbName: "solidapp",
      privateSubnets: network.privateSubnets,
    });
  }
}
