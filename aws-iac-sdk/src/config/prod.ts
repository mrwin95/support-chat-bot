import { EnvConfig } from "../models/EnvConfig";

export const prodConfig: EnvConfig = {
  name: "",
  accountId: "",
  roleArn: "",
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
};
