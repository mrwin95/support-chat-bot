import { EnvConfig } from "../models/EnvConfig";

export const devConfig: EnvConfig = {
  name: "Dev",
  accountId: "wadmin",
  roleArn: "arn:aws:iam::222222222222:role/ProdInfraProvisionRole",
  region: "ap-south-1",

  vpc: { name: "DevVPC", cidrBlock: "10.30.0.0/16" },
  subnets: [
    {
      name: "DevSubnetPublic1a",
      cidrBlock: "10.30.1.0/19",
      availabilityZone: "ap-south-1a",
    },
    // {
    //   name: "DevSubnetPublic1b",
    //   cidrBlock: "10.0.2.0/19",
    //   availabilityZone: "ap-south-1b",
    // },
    {
      name: "DevSubnetPrivate1a",
      cidrBlock: "10.30.3.0/19",
      availabilityZone: "ap-south-1a",
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
          fromPort: "80",
          toPort: "80",
          cidr: "0.0.0.0/0",
        },
        {
          protocol: "tcp",
          fromPort: "443",
          toPort: "443",
          cidr: "0.0.0.0/0",
        },
      ],
    },
  ],
};
