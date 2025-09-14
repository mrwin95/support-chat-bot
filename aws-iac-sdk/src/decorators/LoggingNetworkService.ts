import { IResource } from "../interfaces/IResource";

export class LoggingNetworkService implements INetworkService {
  constructor(private service: INetworkService) {}

  async createVpc(cidrBlock: string, name: string): Promise<string> {
    console.log(`[LOG] Creating VPC ${name} with CIDR ${cidrBlock}`);
    const id = await this.createVpc(cidrBlock, name);
    console.log(`[LOG] Created VPC ${id}`);
    return id;
  }

  listVpcs(): Promise<{ vpcId: string; cidrBlock: string; name?: string }> {
    throw new Error("Method not implemented.");
  }
  deleteVpc(vpcId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
