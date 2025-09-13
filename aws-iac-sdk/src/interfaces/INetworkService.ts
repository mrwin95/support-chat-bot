export interface INetworkService {
  createVpc(cidrBlock: string, name: string): Promise<string>;
  listVpcs(): Promise<{ vpcId: string; cidrBlock: string; name?: string }>;
  deleteVpc(vpcId: string): Promise<void>;
}
