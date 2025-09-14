export interface SubnetConfig {
  cidrBlock: string;
  name: string;
  availabilityZone: string;
  type: "public" | "private";
}
