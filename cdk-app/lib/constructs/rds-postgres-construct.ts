import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Duration, RemovalPolicy } from "aws-cdk-lib";

export interface RdsPostgresProps {
  vpc: ec2.Vpc;
  //   cluster: eks.Cluster;
  dbName?: string;
  //   namespace: string;
  //   serviceAccountName: string;
  instanceType?: ec2.InstanceType;
  ssmPrefix: string;
  allocatedStorage?: number;
  multiAz?: boolean;
  removalPolicy?: RemovalPolicy;
  privateSubnets: ec2.ISubnet[]; // 👈 full control (subnets from your Network stack)
  //   subnetType?: ec2.SubnetType;
}

export class RdsPostgresConstruct extends Construct {
  //   public readonly instance: rds.DatabaseInstance;
  public readonly secret: secretsmanager.ISecret;
  public readonly instance: rds.DatabaseInstance;
  //   public readonly proxy: rds.DatabaseProxy;
  //   public readonly sa: eks.ServiceAccount;
  constructor(scope: Construct, id: string, props: RdsPostgresProps) {
    super(scope, id);

    const {
      vpc,
      privateSubnets,
      dbName = "appdb",
      instanceType = ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.SMALL
      ),
      allocatedStorage = 50,
      multiAz = false,
      removalPolicy = RemovalPolicy.DESTROY,
    } = props;

    // genrate master user

    this.secret = new secretsmanager.Secret(this, "DbCredentialsSecret", {
      secretName: `${dbName}-credentials`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: "postgres" }),
        generateStringKey: "password",
        excludePunctuation: true,
      },
    });

    const subnetGroup = new rds.SubnetGroup(this, "PostgresSubnetGroup", {
      description: "Private subnets for postgresql",
      vpc,
      vpcSubnets: { subnets: privateSubnets },
      removalPolicy,
    });

    this.instance = new rds.DatabaseInstance(this, "PostgresInstance", {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_17,
      }),
      vpc,
      vpcSubnets: { subnets: privateSubnets },
      subnetGroup,
      credentials: rds.Credentials.fromSecret(this.secret),
      allocatedStorage,
      instanceType,
      multiAz,
      publiclyAccessible: false,
      backupRetention: Duration.days(1),
      deleteAutomatedBackups: true,
      removalPolicy,
      databaseName: dbName,
    });

    new StringParameter(this, "RdsEndpointSsm", {
      parameterName: `${props.ssmPrefix}Endpoint`,
      stringValue: this.instance.instanceEndpoint.hostname,
    });

    new StringParameter(this, "RdsPortSsm", {
      parameterName: `${props.ssmPrefix}Port`,
      stringValue: this.instance.dbInstanceEndpointPort,
    });

    new StringParameter(this, "RdsDbNameSsm", {
      parameterName: `${props.ssmPrefix}Dbname`,
      stringValue: dbName,
    });

    new StringParameter(this, "RdsSecretArnSsm", {
      parameterName: `${props.ssmPrefix}SecretArn`,
      stringValue: this.secret.secretArn,
    });
  }
}
