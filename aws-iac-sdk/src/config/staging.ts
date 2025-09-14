import { EnvConfig } from "../models/EnvConfig";

export const stagingConfig: EnvConfig = {
  name: "",
  accountId: "",
  roleArn: "",
  region: "ap-south-1",
  vpc: { name: "StagingVPC", cidrBlock: "10.30.0.0/16" },
  subnets: [
    {
      name: "StagingSubnetPublic1a",
      cidrBlock: "10.30.1.0/19",
      availabilityZone: "ap-south-1a",
      type: "public",
    },
    // {
    //   name: "DevSubnetPublic1b",
    //   cidrBlock: "10.0.2.0/19",
    //   availabilityZone: "ap-south-1b",
    // },
    {
      name: "StagingSubnetPrivate1a",
      cidrBlock: "10.30.3.0/19",
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
      name: "StagingWebSG",
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
