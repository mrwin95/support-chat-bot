import { EnvConfig } from "../models/EnvConfig";

export const devConfig: EnvConfig = {
  name: "Dev",
  accountId: "wadmin",
  roleArn: "arn:aws:iam::222222222222:role/ProdInfraProvisionRole",
  region: "ap-south-1",

  vpc: { name: "DevVPC", cidrBlock: "10.20.0.0/16" },
  subnets: [
    {
      name: "DevSubnetPublic1a",
      cidrBlock: "10.20.128.0/20",
      availabilityZone: "ap-south-1a",
      type: "public",
    },
    // {
    //   name: "DevSubnetPublic1b",
    //   cidrBlock: "10.0.2.0/19",
    //   availabilityZone: "ap-south-1b",
    // },
    {
      name: "DevSubnetPrivate1a",
      cidrBlock: "10.20.0.0/19",
      availabilityZone: "ap-south-1a",
      type: "private",
    },
    // {
    //   name: "DevSubnetPrivate1b",
    //   cidrBlock: "10.0.4.0/19",
    //   availabilityZone: "ap-south-1b",
    // },
  ],
  securityGroups: [
    {
      name: "DevWebSG",
      description: "Allow HTTP/HTTPS",
      ingressRules: [
        {
          protocol: "tcp",
          fromPort: 80,
          toPort: 80,
          cidr: "0.0.0.0/0",
        },
        {
          protocol: "tcp",
          fromPort: 443,
          toPort: 443,
          cidr: "0.0.0.0/0",
        },
      ],
    },
  ],
};
