export interface INetworkConfig {
  cidr: string;
  maxAzs: number;
  natGateways?: number;
  publicCidrs: string[];
  privateCidrs: string[];
}
