import { EnvConfig } from "../models/EnvConfig";

export const prodConfig: EnvConfig = {
  name: "",
  accountId: "",
  roleArn: "",
  region: "ap-south-1",
  vpc: { name: "ProdVPC", cidrBlock: "10.40.0.0/16" },
  subnets: [
    {
      name: "ProdSubnetPublic1a",
      cidrBlock: "10.40.1.0/19",
      availabilityZone: "ap-south-1a",
      type: "public",
    },
    // {
    //   name: "DevSubnetPublic1b",
    //   cidrBlock: "10.0.2.0/19",
    //   availabilityZone: "ap-south-1b",
    // },
    {
      name: "ProdSubnetPrivate1a",
      cidrBlock: "10.40.3.0/19",
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
      name: "ProdWebSG",
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
