export interface INetworkConfig {
  cidr: string;
  publicSubnetCidrs: string[];
  privateSubnetCidrs: string[];
  maxAzs: number;
  natGateways: number; // new: how many NAT gateways you want
  tags?: { [Key: string]: string };
}
