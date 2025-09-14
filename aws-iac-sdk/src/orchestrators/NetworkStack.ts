import { IResource } from "../interfaces/IResource";
import { EnvConfig } from "../models/EnvConfig";
import { VpcConfig } from "../models/VpcConfig";
import { SubnetService } from "../services/SubnetService";

export class NetworkStack {
  constructor(
    private vpcService: IResource<VpcConfig>,
    private subnetService: SubnetService
  ) {}

  async provision(env: EnvConfig) {
    const vpcId = await this.vpcService.createVpc(env.vpc);
    for (const subnet of env.subnets) {
      await this.subnetService.create({ ...subnet, vpcId });
    }

    return vpcId;
  }

  async destroy(vpcId: string) {
    await this.vpcService.deleteVpc(vpcId);
  }
}
