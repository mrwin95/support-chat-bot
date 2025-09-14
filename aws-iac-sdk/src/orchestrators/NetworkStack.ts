import { IResource } from "../interfaces/IResource";
import { EnvConfig } from "../models/EnvConfig";
import { VpcConfig } from "../models/VpcConfig";
import { SecurityGroupService } from "../services/SecurityGroupService";
import { SubnetService } from "../services/SubnetService";

export class NetworkStack {
  constructor(
    private vpcService: IResource<VpcConfig>,
    private subnetService: SubnetService,
    private sgService: SecurityGroupService
  ) {}

  async provision(env: EnvConfig) {
    const vpcId = await this.vpcService.createVpc(env.vpc);
    const subnetIds: string[] = [];
    for (const subnet of env.subnets) {
      const subnetId = await this.subnetService.create({ ...subnet, vpcId });
      subnetIds.push(subnetId);
    }

    const sgIds: string[] = [];
    for (const sg of env.securityGroups) {
      const sgId = await this.sgService.create({ ...sg, vpcId });
      sgIds.push(sgId);
    }

    return { vpcId, subnetIds, sgIds };
  }

  async destroy(vpcId: string) {
    await this.vpcService.deleteVpc(vpcId);
  }
}
