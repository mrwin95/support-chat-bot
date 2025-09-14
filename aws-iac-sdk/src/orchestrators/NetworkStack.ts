import { IResource } from "../interfaces/IResource";
import { EnvConfig } from "../models/EnvConfig";
import { VpcConfig } from "../models/VpcConfig";
import { InternetGatewayService } from "../services/InternetGatewayService";
import { NatGatewayService } from "../services/NatGatewayService";

import { RouteTableService } from "../services/RouteTableService";
import { SecurityGroupService } from "../services/SecurityGroupService";
import { SubnetService } from "../services/SubnetService";

export class NetworkStack {
  constructor(
    private vpcService: IResource<VpcConfig>,
    private subnetService: SubnetService,
    private sgService: SecurityGroupService,
    private igwService: InternetGatewayService,
    private rtService: RouteTableService,
    private natService: NatGatewayService
  ) {}

  async provision(env: EnvConfig) {
    console.log(`Provisioning network stack for ${env.name} in ${env.region}`);

    // const vpcId = await this.vpcService.createVpc(env.vpc);
    const vpcId = await this.vpcService.createVpc(env.vpc);

    // 2.
    const igwId = await this.igwService.createAndAttach(
      vpcId,
      `${env.name}-igw`
    );

    // const subnetIds: string[] = [];
    const subnetIds: Record<string, string> = {};
    const publicSubnets: string[] = [];
    const privateSubnets: string[] = [];

    for (const subnet of env.subnets) {
      const subnetId = await this.subnetService.create({ ...subnet, vpcId });
      //   subnetIds.push(subnetId);
      subnetIds[subnet.name] = subnetId;

      if (subnet.type === "public") publicSubnets.push(subnetId);
      else privateSubnets.push(subnetId);
    }

    //
    const publicRtId = await this.rtService.create({
      name: `${env.name}-public-rt`,
      type: "public",
      vpcId,
      igwId,
    });

    for (const subnetId of publicSubnets) {
      await this.rtService.associate(publicRtId, subnetId);
    }

    //
    const privateRtId = await this.rtService.create({
      name: `${env.name}-private-rt`,
      type: "private",
      vpcId,
      igwId,
    });

    for (const subnetId of privateSubnets) {
      await this.rtService.associate(privateRtId, subnetId);
    }

    let natId: string | undefined;

    if (env.natGateway) {
      const subnetId = subnetIds[env.natGateway.subnetName];
      if (subnetId) {
        natId = await this.natService.create(subnetId, env.natGateway.name);
        await this.rtService.addNatRoute(privateRtId, natId);
      }
    }

    const sgIds: string[] = [];
    for (const sg of env.securityGroups) {
      const sgId = await this.sgService.create({ ...sg, vpcId });
      sgIds.push(sgId);
    }

    return { vpcId, igwId, natId, subnetIds, publicRtId, privateRtId, sgIds };
  }

  async destroy(vpcId: string) {
    await this.vpcService.deleteVpc(vpcId);
  }
}
