import { IResource } from "../interfaces/IResource";

export class LoggingDecorator<TConfig> implements IResource<TConfig> {
  constructor(private resource: IResource<TConfig>) {}

  async createVpc(config: TConfig): Promise<string> {
    console.log(`[LOG] Creating: ${config}`);
    const id = await this.resource.createVpc(config);
    console.log(`[LOG] Created Resource ${id}`);
    return id;
  }

  async listVpcs(): Promise<any[]> {
    console.log(`[LOG] Listing resources...`);
    return this.resource.listVpcs();
  }
  async deleteVpc(vpcId: string): Promise<void> {
    console.log(`[LOG] Deleting: ${vpcId}`);
    await this.resource.deleteVpc(vpcId);
  }
}
